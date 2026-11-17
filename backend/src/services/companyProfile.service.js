const CompanyProfile = require('../models/CompanyProfile');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

const ALLOWED_FIELDS = [
  'companyName',
  'industry',
  'companySize',
  'website',
  'description',
  'headquarters',
  'foundedYear',
  'socialLinks',
];

async function getOrCreateCompany(ownerId) {
  let company = await CompanyProfile.findOne({ owner: ownerId });
  if (!company) {
    company = await CompanyProfile.create({ owner: ownerId, companyName: 'Untitled Company' });
  }
  return company;
}

async function updateCompany(ownerId, updates) {
  const company = await getOrCreateCompany(ownerId);

  ALLOWED_FIELDS.forEach((field) => {
    if (updates[field] !== undefined) {
      if (field === 'socialLinks') {
        company.socialLinks = { ...(company.socialLinks?.toObject?.() || {}), ...updates.socialLinks };
      } else {
        company[field] = updates[field];
      }
    }
  });

  await company.save();
  return company;
}

async function uploadLogo(ownerId, file) {
  if (!file) {
    throw ApiError.badRequest('A logo image is required');
  }

  const company = await getOrCreateCompany(ownerId);

  if (company.logo?.publicId) {
    await deleteFromCloudinary(company.logo.publicId, 'image');
  }

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: env.cloudinary.logoFolder,
    resourceType: 'image',
    publicId: `${ownerId}-logo`,
  });

  company.logo = { url: result.secure_url, publicId: result.public_id };
  await company.save();
  return company;
}

async function getCompanyById(companyId) {
  const company = await CompanyProfile.findById(companyId);
  if (!company) {
    throw ApiError.notFound('Company profile not found');
  }
  return company;
}

module.exports = {
  getOrCreateCompany,
  updateCompany,
  uploadLogo,
  getCompanyById,
};
