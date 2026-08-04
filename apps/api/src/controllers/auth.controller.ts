import { VerifyEmailFormValues } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { successResponse } from "../utils/response.js";

export const authController = {
  signUp: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responseData = await authService.signUpUser(req.body);

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },

  verifyEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.query as VerifyEmailFormValues;

      console.log("token is ", token);

      const responseData = await authService.verifyEmailToken(token);

      console.log("responseData is ", responseData);

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },

  resendVerification: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responseData = await authService.resendVerificationToken(req.body);

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },

  signIn: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responseData = await authService.signInUser(req.body);

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },

  oauthGoogle: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responseData = await authService.oauthGoogleLogin(req.body);

      res.status(200).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responseData = await authService.requestPasswordReset(req.body);

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responseData = await authService.resetPassword(req.body);

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },
};
