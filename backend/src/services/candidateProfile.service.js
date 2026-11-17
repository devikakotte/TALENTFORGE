const CandidateProfile = require('../models/CandidateProfile');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

const ALLOWED_PROFILE_FIELDS = ['headline', 'bio', 'phone', 'location', 'skills', 'socialLinks', 'isDiscoverable'];

async function getOrCreateProfile(userId) {
  let profile = await CandidateProfile.findOne({ user: userId });
  if (!profile) {
    profile = await CandidateProfile.create({ user: userId });
  }
  return profile;
}

async function updateProfile(userId, updates) {
  const profile = await getOrCreateProfile(userId);

  ALLOWED_PROFILE_FIELDS.forEach((field) => {
    if (updates[field] !== undefined) {
      if (field === 'socialLinks') {
        profile.socialLinks = { ...profile.socialLinks.toObject(), ...updates.socialLinks };
      } else {
        profile[field] = updates[field];
      }
    }
  });

  await profile.save();
  return profile;
}

async function uploadResume(userId, file) {
  if (!file) {
    throw ApiError.badRequest('A resume file is required');
  }

  const profile = await getOrCreateProfile(userId);

  // Remove the previous resume from Cloudinary before uploading the new one.
  if (profile.resume?.publicId) {
    await deleteFromCloudinary(profile.resume.publicId, 'raw');
  }

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: env.cloudinary.resumeFolder,
    resourceType: 'raw',
    publicId: `${userId}-${Date.now()}`,
  });

  profile.resume = {
    url: result.secure_url,
    publicId: result.public_id,
    originalFileName: file.originalname,
    uploadedAt: new Date(),
  };
  await profile.save();
  return profile;
}

async function deleteResume(userId) {
  const profile = await getOrCreateProfile(userId);
  if (profile.resume?.publicId) {
    await deleteFromCloudinary(profile.resume.publicId, 'raw');
  }
  profile.resume = {};
  await profile.save();
  return profile;
}

async function uploadProfilePhoto(userId, file) {
  if (!file) {
    throw ApiError.badRequest('An image file is required');
  }

  const profile = await getOrCreateProfile(userId);

  if (profile.profilePhoto?.publicId) {
    await deleteFromCloudinary(profile.profilePhoto.publicId, 'image');
  }

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: env.cloudinary.profilePhotoFolder,
    resourceType: 'image',
    publicId: `${userId}-photo`,
  });

  profile.profilePhoto = { url: result.secure_url, publicId: result.public_id };
  await profile.save();
  return profile;
}

// --- Generic sub-document collection helpers (education / experience / certifications) ---

function getSubdocumentArray(profile, collectionName) {
  if (!['education', 'experience', 'certifications'].includes(collectionName)) {
    throw ApiError.badRequest(`Unknown profile collection: ${collectionName}`);
  }
  return profile[collectionName];
}

async function addSubdocument(userId, collectionName, itemData) {
  const profile = await getOrCreateProfile(userId);
  getSubdocumentArray(profile, collectionName).push(itemData);
  await profile.save();
  return profile;
}

async function updateSubdocument(userId, collectionName, itemId, itemData) {
  const profile = await getOrCreateProfile(userId);
  const item = getSubdocumentArray(profile, collectionName).id(itemId);
  if (!item) {
    throw ApiError.notFound(`${collectionName} entry not found`);
  }
  Object.assign(item, itemData);
  await profile.save();
  return profile;
}

async function removeSubdocument(userId, collectionName, itemId) {
  const profile = await getOrCreateProfile(userId);
  const item = getSubdocumentArray(profile, collectionName).id(itemId);
  if (!item) {
    throw ApiError.notFound(`${collectionName} entry not found`);
  }
  item.deleteOne();
  await profile.save();
  return profile;
}

// --- Talent Search (recruiter-facing) ---
// A candidate only ever appears here if they explicitly opted in via
// isDiscoverable - the reverse of the usual "post a job and wait" flow,
// letting recruiters proactively source candidates that haven't applied
// to anything yet.

async function searchDiscoverableCandidates({ skills, location, page = 1, limit = 12 }) {
  const query = { isDiscoverable: true, headline: { $exists: true, $ne: '' } };

  if (skills) {
    const skillList = skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    if (skillList.length > 0) {
      query.skills = { $in: skillList.map((skill) => new RegExp(`^${skill}$`, 'i')) };
    }
  }
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const [profiles, total] = await Promise.all([
    CandidateProfile.find(query)
      .populate('user', 'fullName')
      .select('headline bio skills verifiedSkills location experience resume profilePhoto user')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    CandidateProfile.countDocuments(query),
  ]);

  return {
    candidates: profiles,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

module.exports = {
  getOrCreateProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  uploadProfilePhoto,
  addSubdocument,
  updateSubdocument,
  removeSubdocument,
  searchDiscoverableCandidates,
};
