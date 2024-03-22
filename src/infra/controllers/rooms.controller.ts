import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ExampleEvent } from '../websockets/events/enter-room';
import { CreateRoomDto } from '../dtos/rooms/create-room.dto';
import { UpdateRoomDto } from '../dtos/rooms/update-room.dto';
import { FindRoomsByLocationDto } from '../dtos/rooms/find-rooms-by-location.dto';
import { SignOutRoomDto } from '../dtos/rooms/sign-out-room.dto';
import { SignInRoomDto } from '../dtos/rooms/sign-in-room.dto';
import { SignInRoomAcceptDto } from '../dtos/rooms/sign-in-room-accept.dto';
import { CreateRoomService } from '@/application/use-cases/rooms/create-room.service';
import { UpdateRoomService } from '@/application/use-cases/rooms/update-room.service';
import { FindAllRoomsByLocationService } from '@/application/use-cases/rooms/find-all-rooms-by-location.service';
import { SignOutMemberService } from '@/application/use-cases/members/sign-out-member.service';
import { DeleteUniqueRoomService } from '@/application/use-cases/rooms/delete-unique-room.service';
import { VoteRoomDto } from '../dtos/rooms/vote-room.dto';
import { VoteMemberService } from '@/application/use-cases/members/vote-member.service';
import { ClearVotesMembersService } from '@/application/use-cases/members/clear-votes-members.service';
import { SignInMemberService } from '@/application/use-cases/members/sign-in-member.service';

@Controller('rooms')
export class RoomsController {
  constructor(
    private exampleEvent: ExampleEvent,

    private findUniqueRoomByLocationService: FindAllRoomsByLocationService,
    private createRoomService: CreateRoomService,
    private updateRoomService: UpdateRoomService,
    private signOutMemberService: SignOutMemberService,
    private deleteUniqueRoomService: DeleteUniqueRoomService,
    private voteMemberService: VoteMemberService,
    private clearVotesMembersService: ClearVotesMembersService,
    private signInMemberService: SignInMemberService,
  ) {}

  @Get('/location')
  async findByLocation(@Query() query: FindRoomsByLocationDto) {
    const room = await this.findUniqueRoomByLocationService.execute(query);

    return room;
  }

  @Post()
  @HttpCode(201)
  async createRoom(@Body() body: CreateRoomDto) {
    const { room } = await this.createRoomService.execute({
      name: body.name,
      userName: body.user_name,
      lat: body.lat,
      lng: body.lng,
      private: body.private,
      userId: body.user_id,
    });

    return room;
  }

  @Post(':roomId/sign-in')
  async signIn(@Param('roomId') roomId: string, @Body() body: SignInRoomDto) {
    await this.signInMemberService.execute({
      roomId,
      userName: body.user_name,
      access: body.access,
      userId: body.user_id,
    });
  }

  @Post(':roomId/sign-in/accept')
  async signInAccept(
    @Param('roomId') roomId: string,
    @Body() body: SignInRoomAcceptDto,
  ) {}

  @Post(':roomId/sign-out')
  async signOut(@Param('roomId') roomId: string, @Body() body: SignOutRoomDto) {
    await this.signOutMemberService.execute({
      memberId: body.room_id,
      roomId,
      userActionId: body.user_action_id,
    });
  }

  @Post(':roomId/vote')
  async vote(@Param('roomId') roomId: string, @Body() body: VoteRoomDto) {
    await this.voteMemberService.execute({
      userId: body.user_id,
      vote: body.vote,
      roomId,
    });
  }

  @Post(':roomId/vote/clear')
  async clearVotes(
    @Param('roomId') roomId: string,
    @Query('user_id') userId: string,
  ) {
    await this.clearVotesMembersService.execute({
      userId,
      roomId,
    });
  }

  @Patch(':roomId')
  async updateRoom(
    @Param('roomId') roomId: string,
    @Query('user_id') userId: string,
    @Body() body: UpdateRoomDto,
  ) {
    const { room } = await this.updateRoomService.execute(
      { roomId, userId },
      body,
    );

    return room;
  }

  @Delete(':roomId')
  async deleteUnique(
    @Param('roomId') roomId: string,
    @Query('user_id') userId: string,
  ) {
    await this.deleteUniqueRoomService.execute({ roomId, userId });
  }
}
