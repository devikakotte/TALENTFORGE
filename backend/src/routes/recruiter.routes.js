const { Router } = require('express');
const companyProfileController = require('../controllers/companyProfile.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/uploadMiddleware');
const { updateCompanyValidator } = require('../validators/companyProfile.validator');
const { talentSearchValidator } = require('../validators/candidateProfile.validator');

const router = Router();

router.use(authenticate, authorize('recruiter'));

router.get('/me/company', companyProfileController.getMyCompany);
router.patch(
  '/me/company',
  updateCompanyValidator,
  validateRequest,
  companyProfileController.updateMyCompany,
);
router.post('/me/company/logo', uploadImage.single('logo'), companyProfileController.uploadLogo);

router.get(
  '/talent-search',
  talentSearchValidator,
  validateRequest,
  companyProfileController.talentSearch,
);

module.exports = router;
