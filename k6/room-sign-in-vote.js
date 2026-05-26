import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'https://scrum-poker-api.vercel.app';
const ROOM_ID = __ENV.ROOM_ID || '12799c49-3f63-462b-87b4-555a8c433220';
const ACCESS = __ENV.ACCESS || 'cd8ac3b4-4854-4e82-b0fa-3ebbd83aae47';
const USERS = Number(__ENV.USERS || 300);
const VOTE = __ENV.VOTE || 'nature/8.png';
const USER_NAME_PREFIX = __ENV.USER_NAME_PREFIX || 'teste';
const POLL_INTERVAL_SECONDS = Number(__ENV.POLL_INTERVAL_SECONDS || 2);
const MAX_PENDING_WAIT_SECONDS = Number(__ENV.MAX_PENDING_WAIT_SECONDS || 120);
const MAX_SIGN_IN_RETRIES = Number(__ENV.MAX_SIGN_IN_RETRIES || 5);
const MAX_VOTE_RETRIES = Number(__ENV.MAX_VOTE_RETRIES || 3);
const VOTE_RETRY_DELAY_SECONDS = Number(__ENV.VOTE_RETRY_DELAY_SECONDS || 1);
const FLOW_MAX_DURATION_SECONDS =
  Number(__ENV.FLOW_MAX_DURATION_SECONDS) || MAX_PENDING_WAIT_SECONDS + 60;

export const options = {
  scenarios: {
    room_flow: {
      executor: 'per-vu-iterations',
      vus: USERS,
      iterations: 1,
      maxDuration: `${FLOW_MAX_DURATION_SECONDS}s`,
    },
  },
};

function parseJsonOrNull(response) {
  try {
    return response.json();
  } catch {
    return null;
  }
}

function makeUserName(attempt) {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timestamp = Date.now();

  return `${USER_NAME_PREFIX}-${exec.vu.idInTest}-${attempt}-${timestamp}-${randomPart}`;
}

function signIn(userName) {
  return http.post(
    `${BASE_URL}/rooms/${ROOM_ID}/sign-in`,
    JSON.stringify({
      access: ACCESS,
      user_name: userName,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

function getRoom() {
  return http.get(`${BASE_URL}/rooms/${ROOM_ID}`);
}

function vote(userId) {
  return http.post(
    `${BASE_URL}/rooms/${ROOM_ID}/vote`,
    JSON.stringify({
      user_id: userId,
      vote: VOTE,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

function isVoteSuccessStatus(status) {
  return status === 200 || status === 201 || status === 204;
}

export default function () {
  const maxPolls = Math.ceil(MAX_PENDING_WAIT_SECONDS / POLL_INTERVAL_SECONDS);

  for (let attempt = 1; attempt <= MAX_SIGN_IN_RETRIES; attempt += 1) {
    const userName = makeUserName(attempt);
    const signInResponse = signIn(userName);

    const signInOk = check(signInResponse, {
      'sign-in returned 201': (response) => response.status === 201,
    });

    if (!signInOk) {
      console.error(
        `sign-in failed for ${userName} with status ${signInResponse.status}; attempt ${attempt}/${MAX_SIGN_IN_RETRIES}`,
      );
      sleep(1);
      continue;
    }

    const signInBody = parseJsonOrNull(signInResponse);
    const userId = signInBody?.user?.id;

    if (!userId) {
      fail(`sign-in response did not return user.id for ${userName}`);
    }

    let shouldRetryFromStart = false;

    for (let pollAttempt = 1; pollAttempt <= maxPolls; pollAttempt += 1) {
      const roomResponse = getRoom();

      const roomOk = check(roomResponse, {
        'room GET returned 200': (response) => response.status === 200,
      });

      if (!roomOk) {
        sleep(POLL_INTERVAL_SECONDS);
        continue;
      }

      const roomBody = parseJsonOrNull(roomResponse);
      const members = Array.isArray(roomBody?.members) ? roomBody.members : [];
      const currentMember = members.find(
        (member) => member?.user_id === userId || member?.member?.id === userId,
      );

      if (!currentMember) {
        sleep(POLL_INTERVAL_SECONDS);
        continue;
      }

      const memberStatus = String(currentMember.status || '').toUpperCase();

      if (memberStatus === 'LOGGED') {
        for (let voteAttempt = 1; voteAttempt <= MAX_VOTE_RETRIES; voteAttempt += 1) {
          const voteResponse = vote(userId);
          const voteOk = isVoteSuccessStatus(voteResponse.status);

          check(voteResponse, {
            'vote returned 200, 201 or 204': (response) =>
              isVoteSuccessStatus(response.status),
          });

          if (voteOk) {
            return;
          }

          console.error(
            `vote failed for user ${userId} with status ${voteResponse.status}; vote attempt ${voteAttempt}/${MAX_VOTE_RETRIES}`,
          );
          sleep(VOTE_RETRY_DELAY_SECONDS);
        }

        fail(
          `vote failed for user ${userId} after ${MAX_VOTE_RETRIES} attempts while status was LOGGED`,
        );
      }

      if (memberStatus === 'REFUSED') {
        console.warn(
          `user ${userId} was REFUSED; restarting flow from sign-in (attempt ${attempt}/${MAX_SIGN_IN_RETRIES})`,
        );
        shouldRetryFromStart = true;
        break;
      }

      sleep(POLL_INTERVAL_SECONDS);
    }

    if (shouldRetryFromStart) {
      continue;
    }

    fail(
      `user ${userId} remained pending or not found after ${MAX_PENDING_WAIT_SECONDS}s waiting for LOGGED`,
    );
  }

  fail(`flow failed after ${MAX_SIGN_IN_RETRIES} sign-in retries`);
}