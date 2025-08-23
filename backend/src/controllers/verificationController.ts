import { Request, Response } from 'express';
import prisma from '../db/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// Generate a unique verification code
function generateVerificationCode(): string {
    return `leetracker-${Math.random().toString(36).substring(2, 8)}-${Date.now()}`;
}

// Initiate profile verification
export const initiateProfileVerification = asyncHandler(async (req: Request, res: Response) => {
    const { leetcodeUsername, userId } = req.body;

    if (!leetcodeUsername || !userId) {
        throw new ApiError(400, 'LeetCode username and user ID are required');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check if this LeetCode profile is already verified by another user
    const existingVerification = await prisma.leetCodeVerification.findFirst({
        where: {
            leetcodeUsername,
            isVerified: true,
            userId: { not: userId }
        }
    });

    if (existingVerification) {
        throw new ApiError(409, 'This LeetCode profile is already verified by another user');
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store or update verification request
    const verification = await prisma.leetCodeVerification.upsert({
        where: {
            userId_leetcodeUsername: {
                userId: userId,
                leetcodeUsername
            }
        },
        update: {
            verificationCode,
            isVerified: false,
            verificationMethod: 'PROFILE_BIO',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            updatedAt: new Date()
        },
        create: {
            userId: userId,
            leetcodeUsername,
            verificationCode,
            isVerified: false,
            verificationMethod: 'PROFILE_BIO',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
    });

    res.status(200).json(new ApiResponse(200, {
        verificationCode,
        instructions: [
            '1. Go to your LeetCode profile settings',
            '2. Add this verification code to your profile bio or summary',
            '3. Save your profile changes',
            '4. Come back here and click "Verify Profile"',
            '',
            'Note: You can remove the code from your bio after verification is complete.',
            'This verification code expires in 24 hours.'
        ]
    }, 'Verification initiated. Please follow the instructions to verify your profile.'));
});

// Verify profile ownership
export const verifyProfileOwnership = asyncHandler(async (req: Request, res: Response) => {
    const { userId, leetcodeUsername } = req.body;

    if (!userId || !leetcodeUsername) {
        throw new ApiError(400, 'User ID and LeetCode username are required');
    }

    // Get verification record
    const verification = await prisma.leetCodeVerification.findUnique({
        where: {
            userId_leetcodeUsername: {
                userId: userId,
                leetcodeUsername
            }
        }
    });

    if (!verification) {
        throw new ApiError(404, 'No verification request found. Please initiate verification first.');
    }

    if (verification.expiresAt < new Date()) {
        throw new ApiError(400, 'Verification code has expired. Please initiate verification again.');
    }

    if (verification.isVerified) {
        throw new ApiError(400, 'Profile is already verified');
    }

    try {
        // Try to fetch LeetCode profile bio/summary
        // Note: Since LeetCode's GraphQL API is restricted, we'll simulate this
        // In a real implementation, you might use web scraping or LeetCode API
        
        // For now, we'll create a mock verification that checks if the code "exists"
        // In production, you'd scrape the actual profile page
        const profileData = await simulateLeetCodeProfileFetch(leetcodeUsername);
        
        // Check if verification code is in the bio
        const codeExists = profileData.bio?.includes(verification.verificationCode);
        
        if (!codeExists) {
            throw new ApiError(400, 'Verification code not found in your LeetCode profile bio. Please make sure you added the code and saved your profile.');
        }

        // Mark as verified
        await prisma.leetCodeVerification.update({
            where: {
                userId_leetcodeUsername: {
                    userId: userId,
                    leetcodeUsername
                }
            },
            data: {
                isVerified: true,
                verifiedAt: new Date()
            }
        });

        // Update user's LeetCode username
        await prisma.user.update({
            where: { id: userId },
            data: { leetcodeUsername }
        });

        res.status(200).json(new ApiResponse(200, {
            verified: true,
            leetcodeUsername
        }, 'LeetCode profile verified successfully!'));

    } catch (error) {
        console.error('Profile verification error:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Failed to verify profile. Please try again later.');
    }
});

// Get verification status
export const getVerificationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, 'User ID is required');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            leetCodeVerifications: {
                where: { isVerified: true },
                orderBy: { verifiedAt: 'desc' }
            }
        }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const verifiedProfile = user.leetCodeVerifications[0];

    res.status(200).json(new ApiResponse(200, {
        hasVerifiedProfile: !!verifiedProfile,
        verifiedUsername: verifiedProfile?.leetcodeUsername || null,
        verifiedAt: verifiedProfile?.verifiedAt || null
    }, 'Verification status retrieved'));
});

// Remove profile verification (for profile changes)
export const removeProfileVerification = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, 'User ID is required');
    }

    await prisma.leetCodeVerification.deleteMany({
        where: { userId: userId }
    });

    await prisma.user.update({
        where: { id: userId },
        data: { leetcodeUsername: null }
    });

    res.status(200).json(new ApiResponse(200, {}, 'Profile verification removed successfully'));
});

// Simulate LeetCode profile fetch (replace with actual implementation)
async function simulateLeetCodeProfileFetch(username: string) {
    // In a real implementation, you would:
    // 1. Use web scraping to fetch the profile page
    // 2. Parse the HTML to extract bio/summary
    // 3. Or use LeetCode API if available
    
    // For demo purposes, we'll simulate finding the code
    return {
        username,
        bio: `Software Engineer who loves problem solving. leetracker-abc123-1692123456789 Currently working on improving my algorithms skills.`
    };
}
