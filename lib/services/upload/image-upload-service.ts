import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Constants
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Interface for upload result
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Service for handling image uploads
 */
class ImageUploadService {
  /**
   * Ensures the upload directory exists
   */
  private ensureUploadDir() {
    try {
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
      throw new Error('Failed to create upload directory');
    }
  }

  /**
   * Validates the image file
   * @param file The file to validate
   * @returns Error message or null if valid
   */
  private validateFile(file: File): string | null {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, GIF, and WebP are supported.';
    }

    return null;
  }

  /**
   * Handles uploading an image and returns the URL
   * @param file The image file to upload
   * @param userId The user ID for reference
   * @returns UploadResult with the URL or error message
   */
  async uploadImage(file: File, userId: string): Promise<UploadResult> {
    try {
      // Validate the file
      const validationError = this.validateFile(file);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Ensure upload directory exists
      this.ensureUploadDir();

      // Generate a unique filename
      const fileExtension = path.extname(file.name).toLowerCase();
      const uniqueFilename = `${userId}_${uuidv4()}${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFilename);

      // Read the file as array buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write the file to disk
      fs.writeFileSync(filePath, buffer);

      // Generate the public URL
      const publicUrl = `/uploads/${uniqueFilename}`;

      return {
        success: true,
        url: publicUrl
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: 'Failed to upload image'
      };
    }
  }

  /**
   * Deletes an image by URL
   * @param imageUrl The URL of the image to delete
   * @returns UploadResult with success or error message
   */
  async deleteImage(imageUrl: string): Promise<UploadResult> {
    try {
      // Extract filename from URL
      const filename = path.basename(imageUrl);
      const filePath = path.join(UPLOAD_DIR, filename);

      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Delete the file
        fs.unlinkSync(filePath);
      } else {
        console.warn(`File not found for deletion: ${filePath}`);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: 'Failed to delete image'
      };
    }
  }
}

// Export as a singleton
export const imageUploadService = new ImageUploadService();
export default imageUploadService;
