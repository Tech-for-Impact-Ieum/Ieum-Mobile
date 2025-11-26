import * as FileSystem from 'expo-file-system/legacy';
import { Auth } from './auth';
import { MediaItem } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// FileSystemUploadType enum values: BINARY_CONTENT = 0, MULTIPART = 1
const UPLOAD_TYPE_BINARY = 0;
const UPLOAD_TYPE_MULTIPART = 1;

export const MediaService = {
  /**
   * Transcribe audio file
   * @param uri Local file URI
   * @returns Transcribed text
   */
  async transcribeAudio(uri: string): Promise<string> {
    const token = await Auth.getToken();
    
    // Use FileSystem.uploadAsync for reliable file upload
    const response = await FileSystem.uploadAsync(`${API_URL}/transcribe`, uri, {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: UPLOAD_TYPE_MULTIPART as any,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      console.error('Transcription failed:', response.body);
      throw new Error('Transcription failed');
    }

    const data = JSON.parse(response.body);
    if (!data.ok) {
        throw new Error(data.error || 'Transcription failed');
    }
    return data.text;
  },

  /**
   * Upload media file to S3 via backend presigned URL
   * @param uri Local file URI
   * @param type Media type
   * @returns MediaItem with metadata
   */
  async uploadMedia(uri: string, type: 'audio' | 'image' | 'video'): Promise<MediaItem> {
    const token = await Auth.getToken();
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const fileName = uri.split('/').pop() || `file.${type === 'audio' ? 'm4a' : 'jpg'}`;
    const mimeType = type === 'audio' ? 'audio/m4a' : 'image/jpeg'; // Simplified

    // 1. Get Presigned URL
    const presignedRes = await fetch(`${API_URL}/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName,
        fileType: mimeType,
        mediaType: type,
        fileSize: fileInfo.size,
      }),
    });

    if (!presignedRes.ok) {
      const errorData = await presignedRes.json();
      throw new Error(errorData.error || 'Failed to get upload URL');
    }

    const { uploadUrl, fileKey } = await presignedRes.json();

    // 2. Upload to S3
    // S3 PUT requires the raw binary body
    const uploadRes = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: 'PUT',
      uploadType: UPLOAD_TYPE_BINARY as any,
      headers: {
        'Content-Type': mimeType,
      },
    });

    if (uploadRes.status !== 200) {
      throw new Error('Failed to upload to S3');
    }

    return {
      type,
      key: fileKey,
      url: uploadUrl.split('?')[0],
      fileName,
      mimeType,
      fileSize: fileInfo.size,
    };
  }
};
