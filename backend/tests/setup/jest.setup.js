// Runs before every test file. Email sending is mocked globally since
// no test should depend on (or be slowed down by) a real SMTP server -
// the email content/templating itself isn't what these tests verify.
jest.mock('../../src/utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
}));
