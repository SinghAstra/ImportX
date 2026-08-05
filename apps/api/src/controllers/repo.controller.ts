import {
  AUTH_ERROR_CODES,
  deleteMultipleReposInputSchema,
  ingestRepoSchema,
} from "@repo/shared";
import { type NextFunction, type Request, type Response } from "express";
import z from "zod";
import { UnauthorizedError } from "../errors/api-errors.js";
import { repositoryService } from "../services/repo.service.js";
import { successResponse } from "../utils/response.js";

export const repositoryController = {
  ingest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedInput = ingestRepoSchema.parse(req.body);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const responseData = await repositoryService.createRepository({
        userId: req.user.id,
        githubUrl: validatedInput.githubUrl,
      });

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },

  getFiles: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const files = await repositoryService.getRepositoryFiles(id, req.user.id);

      res.status(200).json(successResponse(files));
    } catch (error) {
      next(error);
    }
  },

  async getRepository(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const repository = await repositoryService.getRepositoryDetail(
        id,
        req.user.id
      );

      res.status(200).json(successResponse(repository));
    } catch (error) {
      next(error);
    }
  },

  async getRepositories(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const userId = req.user.id;

      const repositories =
        await repositoryService.getRepositoriesByUserId(userId);

      res.status(200).json(successResponse(repositories));
    } catch (error) {
      next(error);
    }
  },

  async resync(req: Request, res: Response, next: NextFunction) {
    try {
      const repositoryId = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const result = await repositoryService.resyncRepository(
        repositoryId,
        req.user.id
      );

      res.status(202).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async boost(req: Request, res: Response, next: NextFunction) {
    try {
      const repositoryId = z.uuid().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const result = await repositoryService.boostRepository(
        repositoryId,
        req.user.id
      );

      res.status(202).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async deleteSingle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const result = await repositoryService.deleteRepository(id, req.user.id);

      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  async deleteBulk(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const { ids } = deleteMultipleReposInputSchema.parse(req.body);

      const result = await repositoryService.deleteMultipleRepositories(
        ids,
        req.user.id
      );

      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },

  getGraph: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const graphData = await repositoryService.getRepositoryGraph(
        id,
        req.user.id
      );

      res.status(200).json(successResponse(graphData));
    } catch (error) {
      next(error);
    }
  },
};
