import { Controller } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    

    @UseGuards(RefreshTokenGuard)
@Get('refresh')
refreshTokens(@Req() req: Request) {
  const userId = req.user['sub'];
  const refreshToken = req.user['refreshToken'];
  return this.authService.refreshTokens(userId, refreshToken);
}

}
