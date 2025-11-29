import config from './index.js';

/**
 * OpenAPI 3.0 specification for Activity Tracker API
 */
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Activity Tracker API',
    version: '1.0.0',
    description: 'RESTful API for the Activity Tracker application',
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Images', description: 'User image management (avatar/banner)' },
    { name: 'Admin', description: 'Admin user management' },
    { name: 'Webhooks', description: 'Webhook endpoints for integrations' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns server health status',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/users/nickname/{nickname}/available': {
      get: {
        tags: ['Users'],
        summary: 'Check nickname availability',
        description: 'Check if a nickname is available for registration',
        parameters: [
          {
            name: 'nickname',
            in: 'path',
            required: true,
            description: 'Nickname to check',
            schema: { type: 'string', minLength: 3 },
          },
        ],
        responses: {
          '200': {
            description: 'Nickname availability status',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NicknameAvailabilityResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid nickname',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users/profile/status': {
      get: {
        tags: ['Users'],
        summary: 'Check profile status',
        description:
          'Check if the authenticated user has a profile (used for onboarding flow)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile status',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserProfileStatusResponse',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      post: {
        tags: ['Users'],
        summary: 'Create user profile',
        description: 'Create a new user profile for the authenticated user',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User profile created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'User already exists or email/nickname taken',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        description: 'Get the profile of the authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'User account is blocked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        description: 'Update the profile of the authenticated user',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User profile updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'User account is blocked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/images/user/{userId}/{type}': {
      get: {
        tags: ['Images'],
        summary: 'Get user image',
        description:
          "Get a user's image (avatar or banner). Returns thumbnail by default for avatars, use ?original=true for full-size.",
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
          {
            name: 'type',
            in: 'path',
            required: true,
            description: 'Image type',
            schema: { type: 'string', enum: ['avatar', 'banner'] },
          },
          {
            name: 'original',
            in: 'query',
            required: false,
            description: 'Return original full-size image instead of thumbnail',
            schema: { type: 'boolean', default: false },
          },
        ],
        responses: {
          '200': {
            description: 'Image data',
            content: {
              'image/jpeg': { schema: { type: 'string', format: 'binary' } },
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/gif': { schema: { type: 'string', format: 'binary' } },
              'image/webp': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '404': {
            description: 'User or image not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/images/me/{type}': {
      get: {
        tags: ['Images'],
        summary: 'Get current user image',
        description:
          "Get the authenticated user's image. Returns thumbnail by default for avatars.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            description: 'Image type',
            schema: { type: 'string', enum: ['avatar', 'banner'] },
          },
          {
            name: 'original',
            in: 'query',
            required: false,
            description: 'Return original full-size image instead of thumbnail',
            schema: { type: 'boolean', default: false },
          },
        ],
        responses: {
          '200': {
            description: 'Image data',
            content: {
              'image/jpeg': { schema: { type: 'string', format: 'binary' } },
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'image/gif': { schema: { type: 'string', format: 'binary' } },
              'image/webp': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User profile or image not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Images'],
        summary: 'Upload user image',
        description:
          'Upload an image (avatar or banner) for the authenticated user. Max 5MB.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            description: 'Image type',
            schema: { type: 'string', enum: ['avatar', 'banner'] },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'image/jpeg': { schema: { type: 'string', format: 'binary' } },
            'image/png': { schema: { type: 'string', format: 'binary' } },
            'image/gif': { schema: { type: 'string', format: 'binary' } },
            'image/webp': { schema: { type: 'string', format: 'binary' } },
          },
        },
        responses: {
          '200': {
            description: 'Image uploaded successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ImageUploadResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid image data or validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'User account is blocked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Images'],
        summary: 'Delete user image',
        description: "Delete the authenticated user's image (avatar or banner)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            description: 'Image type',
            schema: { type: 'string', enum: ['avatar', 'banner'] },
          },
        ],
        responses: {
          '200': {
            description: 'Image deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'User account is blocked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User profile or image not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users',
        description:
          'Get paginated list of users with optional search and filters. Requires admin privileges.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'perPage',
            in: 'query',
            description: 'Items per page',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search by name, surname, nickname, or email',
            schema: { type: 'string' },
          },
          {
            name: 'role',
            in: 'query',
            description: 'Filter by role',
            schema: { $ref: '#/components/schemas/UserRole' },
          },
          {
            name: 'blocked',
            in: 'query',
            description: 'Filter by blocked status',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          {
            name: 'emailVerified',
            in: 'query',
            description: 'Filter by email verification status',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          {
            name: 'mfaEnabled',
            in: 'query',
            description: 'Filter by MFA enabled status',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated list of users',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminUsersListResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - requires admin privileges',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/admin/users/{userId}': {
      get: {
        tags: ['Admin'],
        summary: 'Get user by ID',
        description: 'Get a specific user by ID. Requires admin privileges.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - requires admin privileges',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/admin/users/{userId}/roles': {
      patch: {
        tags: ['Admin'],
        summary: 'Update user roles',
        description:
          'Update the roles of a user. Super-admins can assign admin roles, regular admins cannot.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AdminUpdateUserRolesRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User roles updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description:
              'Forbidden - insufficient privileges for this operation',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/admin/users/{userId}/blocked': {
      patch: {
        tags: ['Admin'],
        summary: 'Update user blocked status',
        description:
          'Block or unblock a user. Super-admins can block any user except themselves, regular admins can only block non-admin users.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AdminUpdateUserBlockedRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User blocked status updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error or cannot block your own account',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description:
              'Forbidden - insufficient privileges for this operation',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/webhooks/auth0/user-update': {
      post: {
        tags: ['Webhooks'],
        summary: 'Auth0 user update webhook',
        description:
          'Webhook endpoint for Auth0 Post-Login Action to sync MFA status and email verification. Requires x-webhook-secret header.',
        security: [{ WebhookSecret: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Auth0UserUpdateWebhookPayload',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Webhook processed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WebhookSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid or missing webhook secret',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from Auth0',
      },
      WebhookSecret: {
        type: 'apiKey',
        in: 'header',
        name: 'x-webhook-secret',
        description: 'Shared secret for webhook authentication',
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number', description: 'Server uptime in seconds' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Error message' },
          code: { $ref: '#/components/schemas/ErrorCode' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                message: { type: 'string' },
                code: { $ref: '#/components/schemas/ErrorCode' },
              },
            },
          },
        },
        required: ['error', 'code'],
      },
      ErrorCode: {
        type: 'string',
        enum: [
          'VALIDATION_ERROR',
          'RESOURCE_ALREADY_EXISTS',
          'RESOURCE_NOT_FOUND',
          'NOT_FOUND',
          'UNAUTHORIZED',
          'FORBIDDEN',
          'INVALID_TOKEN',
          'USER_ALREADY_EXISTS',
          'USER_NOT_FOUND',
          'USER_BLOCKED',
          'NICKNAME_TAKEN',
          'EMAIL_TAKEN',
          'AGE_REQUIREMENT_NOT_MET',
          'INVALID_SPORT_TYPE',
          'INTERNAL_SERVER_ERROR',
          'SERVER_ERROR',
        ],
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      NicknameAvailabilityResponse: {
        type: 'object',
        properties: {
          available: { type: 'boolean' },
          nickname: { type: 'string' },
        },
        required: ['available', 'nickname'],
      },
      SportType: {
        type: 'string',
        enum: [
          'RUNNING',
          'CYCLING',
          'SWIMMING',
          'TRIATHLON',
          'TRAIL_RUNNING',
          'HIKING',
          'WALKING',
          'GYM',
          'CROSS_FIT',
          'OTHER',
        ],
      },
      PrivacyLevel: {
        type: 'string',
        enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'],
      },
      UserRole: {
        type: 'string',
        enum: [
          'MEMBER',
          'ADMIN',
          'SUPER_ADMIN',
          'ORGANIZATION_COMMITTEE',
          'COMMUNITY_LEADER',
          'COMMUNITY_STAR',
          'GAMER',
        ],
      },
      MfaType: {
        type: 'string',
        enum: [
          'NONE',
          'TOTP',
          'SMS',
          'EMAIL',
          'PUSH',
          'WEBAUTHN',
          'RECOVERY_CODE',
        ],
      },
      UserPrivacySettings: {
        type: 'object',
        properties: {
          email: { $ref: '#/components/schemas/PrivacyLevel' },
          dateOfBirth: { $ref: '#/components/schemas/PrivacyLevel' },
          sportTypes: { $ref: '#/components/schemas/PrivacyLevel' },
          socialLinks: { $ref: '#/components/schemas/PrivacyLevel' },
          avatar: { $ref: '#/components/schemas/PrivacyLevel' },
          banner: { $ref: '#/components/schemas/PrivacyLevel' },
        },
        required: ['email', 'dateOfBirth', 'sportTypes', 'socialLinks'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          surname: { type: 'string' },
          nickname: { type: 'string' },
          email: { type: 'string', format: 'email' },
          dateOfBirth: { type: 'string', format: 'date' },
          sportTypes: {
            type: 'array',
            items: { $ref: '#/components/schemas/SportType' },
          },
          profilePicture: { type: 'string', nullable: true },
          avatarKey: { type: 'string', nullable: true },
          avatarThumbKey: { type: 'string', nullable: true },
          bannerKey: { type: 'string', nullable: true },
          stravaLink: { type: 'string', nullable: true },
          instagramLink: { type: 'string', nullable: true },
          authId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          isBlocked: { type: 'boolean' },
          isEmailVerified: { type: 'boolean' },
          mfaEnabled: { type: 'boolean' },
          mfaType: { $ref: '#/components/schemas/MfaType' },
          roles: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserRole' },
          },
          privacySettings: { $ref: '#/components/schemas/UserPrivacySettings' },
        },
        required: [
          'id',
          'name',
          'surname',
          'nickname',
          'email',
          'dateOfBirth',
          'sportTypes',
          'authId',
          'createdAt',
          'updatedAt',
          'isBlocked',
          'isEmailVerified',
          'mfaEnabled',
          'mfaType',
          'roles',
          'privacySettings',
        ],
      },
      UserResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
        },
        required: ['user'],
      },
      UserProfileStatusResponse: {
        type: 'object',
        properties: {
          hasProfile: { type: 'boolean' },
          user: { $ref: '#/components/schemas/User' },
        },
        required: ['hasProfile'],
      },
      CreateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          surname: { type: 'string', minLength: 1, maxLength: 50 },
          nickname: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9_]+$',
          },
          email: { type: 'string', format: 'email' },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'Must be at least 13 years old',
          },
          sportTypes: {
            type: 'array',
            items: { $ref: '#/components/schemas/SportType' },
            minItems: 1,
            maxItems: 5,
          },
          profilePicture: { type: 'string', format: 'uri', nullable: true },
          stravaLink: {
            type: 'string',
            pattern: '^https://(www\\.)?strava\\.com/athletes/\\d+$',
            nullable: true,
          },
          instagramLink: {
            type: 'string',
            pattern: '^https://(www\\.)?instagram\\.com/[a-zA-Z0-9_.]+/?$',
            nullable: true,
          },
          privacySettings: { $ref: '#/components/schemas/UserPrivacySettings' },
        },
        required: [
          'name',
          'surname',
          'nickname',
          'email',
          'dateOfBirth',
          'sportTypes',
          'privacySettings',
        ],
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          surname: { type: 'string', minLength: 1, maxLength: 50 },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'Must be at least 13 years old',
          },
          sportTypes: {
            type: 'array',
            items: { $ref: '#/components/schemas/SportType' },
            minItems: 1,
            maxItems: 5,
          },
          profilePicture: { type: 'string', format: 'uri', nullable: true },
          stravaLink: {
            type: 'string',
            pattern: '^https://(www\\.)?strava\\.com/athletes/\\d+$',
            nullable: true,
          },
          instagramLink: {
            type: 'string',
            pattern: '^https://(www\\.)?instagram\\.com/[a-zA-Z0-9_.]+/?$',
            nullable: true,
          },
          privacySettings: { $ref: '#/components/schemas/UserPrivacySettings' },
        },
      },
      ImageUploadResponse: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Storage key for the image' },
          thumbKey: {
            type: 'string',
            description: 'Storage key for the thumbnail (avatars only)',
            nullable: true,
          },
          message: { type: 'string' },
        },
        required: ['key', 'message'],
      },
      AdminUsersListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              perPage: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
            required: ['page', 'perPage', 'total', 'totalPages'],
          },
        },
        required: ['data', 'pagination'],
      },
      AdminUpdateUserRolesRequest: {
        type: 'object',
        properties: {
          roles: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserRole' },
            minItems: 1,
          },
        },
        required: ['roles'],
      },
      AdminUpdateUserBlockedRequest: {
        type: 'object',
        properties: {
          isBlocked: { type: 'boolean' },
        },
        required: ['isBlocked'],
      },
      Auth0UserUpdateWebhookPayload: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'Auth0 user ID' },
          email: { type: 'string', format: 'email' },
          email_verified: { type: 'boolean' },
          mfa_enabled: { type: 'boolean' },
          mfa_type: {
            type: 'string',
            description: 'MFA type (e.g., totp, sms, email)',
            nullable: true,
          },
        },
        required: ['user_id', 'email', 'email_verified', 'mfa_enabled'],
      },
      WebhookSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          user_id: { type: 'string' },
          email_verified: { type: 'boolean' },
          mfa_enabled: { type: 'boolean' },
          mfa_type: { $ref: '#/components/schemas/MfaType' },
        },
        required: ['success', 'message', 'user_id'],
      },
    },
  },
};
