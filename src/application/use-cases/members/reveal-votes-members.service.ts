import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  ROOM_NOT_FOUND,
  USER_WITHOUT_PERMISSION,
} from '@/application/errors/errors.constants';
import { Room } from '@prisma/client';
import { MembersRepository } from '@/application/repositories/members.repository';
import { VotesRepository } from '@/application/repositories/votes.repository';
import { VotingRoundsRepository } from '@/application/repositories/voting-rounds.repository';
import { VoteDetailsRepository } from '@/application/repositories/vote-details.repository';

interface RevealVotesMembersServiceProps {
  roomId: string;
  userId: string;
}

@Injectable()
export class RevealVotesMembersService {
  constructor(
    private roomsRepository: RoomsRepository,
    private membersRepository: MembersRepository,
    private votesRepository: VotesRepository,
    private votingRoundsRepository: VotingRoundsRepository,
    private voteDetailsRepository: VoteDetailsRepository,
  ) {}

  async execute(data: RevealVotesMembersServiceProps): Promise<{ room: Room }> {
    const roomExists = await this.roomsRepository.findById(data.roomId);

    if (!roomExists) {
      throw new NotFoundException(ROOM_NOT_FOUND);
    }

    const userActionIsOwnerTheRoom = roomExists.owner_id === data.userId;

    if (!userActionIsOwnerTheRoom) {
      const userActionIsInsideTheRoom =
        await this.membersRepository.findByUserAndRoomId({
          userId: data.userId,
          roomId: data.roomId,
        });

      if (!userActionIsInsideTheRoom)
        throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    const userCanOpenCards = roomExists.who_can_open_cards.includes(
      data.userId,
    );

    if (!userCanOpenCards) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    // Buscar todos os membros da sala com seus votos
    const membersWithVotes = await this.membersRepository.findAllByRoomId(
      data.roomId,
    );

    // Filtrar apenas membros que votaram em valores numéricos válidos (abaixo de 50)
    const votingMembers = membersWithVotes
      .filter((member) => {
        if (!member.vote) return false;

        // Extrair valor numérico do formato "nature/40.svg"
        const match = member.vote.match(/\/(\d+(?:\.\d+)?)\./);
        if (!match) return false;

        const numericValue = Number(match[1]);

        // Verificar se é um número válido e menor que 50
        return !isNaN(numericValue) && numericValue < 50;
      })
      .map((member) => ({
        ...member,
        // Substituir o vote pelo valor extraído para uso posterior
        extractedVote:
          member.vote.match(/\/(\d+(?:\.\d+)?)\./)?.[1] || member.vote,
      }));

    if (
      votingMembers.length > 0 &&
      roomExists.current_issue &&
      roomExists.start_timer
    ) {
      // Definir topic e sector (usar current_issue e current_sector da sala ou valores padrão)
      const topic = roomExists.current_issue;
      const sector = roomExists.current_sector || 'General';

      const stopTimer =
        (roomExists.stop_timer && new Date(roomExists.stop_timer)) ||
        new Date();

      // Calcular durações em segundos
      const totalDurationSeconds = Math.floor(
        (stopTimer.getTime() - roomExists.start_timer.getTime()) / 1000,
      );

      // Verificar se já existe um voto para este tópico e setor específico na sala
      let vote = await this.votesRepository.findByRoomTopicAndSector(
        data.roomId,
        topic,
        sector,
      );
      let currentVoteTotalDuration = 0;

      if (!vote) {
        // Criar novo registro de voto se não existe para esta combinação tópico+setor
        vote = await this.votesRepository.create({
          room: {
            connect: { id: data.roomId },
          },
          topic,
          sector,
        });
      } else {
        // Pegar a duração total atual do voto existente (mesmo tópico e setor)
        currentVoteTotalDuration = vote.total_duration || 0;
      }

      // Calcular duração desta rodada (diferença entre total e já contabilizado)
      const roundDurationSeconds =
        totalDurationSeconds - currentVoteTotalDuration;

      // Criar nova rodada de votação
      const votingRound = await this.votingRoundsRepository.create({
        vote: {
          connect: { id: vote.id },
        },
        voted_at: new Date(),
        duration: roundDurationSeconds,
      });

      // Criar detalhes dos votos (uma entrada para cada membro que votou)
      const voteDetails = votingMembers.map((member) => ({
        voting_round: {
          connect: { id: votingRound.id },
        },
        user: {
          connect: { id: member.user_id },
        },
        card: member.extractedVote,
      }));

      await this.voteDetailsRepository.createMany(voteDetails);

      // Calcular consenso e cartas vencedoras
      const voteCount = new Map<string, number>();
      votingMembers.forEach((member) => {
        const count = voteCount.get(member.extractedVote) || 0;
        voteCount.set(member.extractedVote, count + 1);
      });

      const maxVotes = Math.max(...voteCount.values());
      const winnerCards = Array.from(voteCount.entries())
        .filter(([, count]) => count === maxVotes)
        .map(([card]) => card);

      const consensus = winnerCards.length === 1 ? winnerCards[0] : 'Empate';

      // Atualizar a rodada com o consenso
      await this.votingRoundsRepository.update(votingRound.id, {
        consensus,
        winner_cards: winnerCards,
      });

      // Atualizar o registro de voto com finalized_at e total_duration
      await this.votesRepository.update(vote.id, {
        finalized_at: stopTimer,
        total_duration: totalDurationSeconds,
      });
    }

    const updatedRoom = await this.roomsRepository.update(data.roomId, {
      cards_open: true,
    });

    return { room: updatedRoom };
  }
}
