const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('./ApiError');
const logger = require('../config/logger');

const MAX_EXTRACTED_CHARS = 15000;

/**
 * Downloads the resume file and extracts plain text so it can be
 * included in an AI prompt. Supports PDF and Word (.doc/.docx) - the
 * only formats accepted at upload time (see uploadMiddleware.js).
 */
async function extractResumeText(resumeUrl, originalFileName = '') {
  let response;
  try {
    response = await fetch(resumeUrl);
  } catch (error) {
    logger.error(`Failed to download resume for text extraction: ${error.message}`);
    throw ApiError.serviceUnavailable('Could not retrieve the resume file for analysis');
  }

  if (!response.ok) {
    throw ApiError.serviceUnavailable('Could not retrieve the resume file for analysis');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = originalFileName.toLowerCase().split('.').pop();

  try {
    let text;
    if (extension === 'pdf') {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else {
      // .doc / .docx
      const parsed = await mammoth.extractRawText({ buffer });
      text = parsed.value;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      throw ApiError.badRequest('Could not extract any text from the resume file');
    }
    return trimmed.slice(0, MAX_EXTRACTED_CHARS);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Resume text extraction failed: ${error.message}`);
    throw ApiError.badRequest('Could not read the resume file - it may be corrupted or password-protected');
  }
}

module.exports = { extractResumeText };
