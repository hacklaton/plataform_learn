import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';

export class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    try {
      const user = await UserService.createUser(email, name);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'A user with this email already exists' });
        return;
      }
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Valid User ID is required' });
      return;
    }

    try {
      const { user, source } = await UserService.getUserById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json({ user, source });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
}


