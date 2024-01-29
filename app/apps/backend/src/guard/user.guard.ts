import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';
import * as _ from 'lodash';

@Injectable()
export class UserGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const encodedToken = _.get(request, 'headers.x-authorization');
    if (!encodedToken) return false;

    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken) return false;
    if (!decodedToken?.sub) return false;

    return true;
  }
}
