
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chats.service';
import sendChatDto from './dtos/send-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatService: ChatService) { }

  @UseGuards(JwtAuthGuard)
  @Post('message/:thread')
  chatWithAgent(
    @Param('thread') threadId: string,
    @Body() { query }: sendChatDto,
    @Request() req: any,
  ) {
    if (!threadId) throw new BadRequestException();
    // Prefix threadId with userId to ensure ownership
    const safeThreadId = `${req.user.userId}-${threadId}`;
    return this.chatService.chatWithAgent({ query, thread_id: safeThreadId });
  }
}
