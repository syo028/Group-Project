import { NextFunction, Request, Response } from 'express-serve-static-core'
import { getAuthUser } from '../app/auth/user.js'
import { Context, toExpressContext } from '../app/context.js'
import { User } from '../../db/proxy.js'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  let context: Context = toExpressContext(req, res, next)
  let user = getAuthUser(context)
  if (!user) {
    res.status(401)
    res.json({ error: '未授權訪問' })
    return
  }
  req.user = user
  next()
}
