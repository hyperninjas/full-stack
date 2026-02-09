import harvardLogo from 'assets/images/logo/harvard_logo.webp';
import mailblusterLogo from 'assets/images/logo/mailbluster_logo.webp';
import ndcLogo from 'assets/images/logo/ndc_logo.webp';
import technextLogo from 'assets/images/logo/technext_logo.webp';
import themewagonLogo from 'assets/images/logo/themewagon_logo.webp';
import { EducationHistory, WorkHistory } from 'types/accounts';

export const workHistory: WorkHistory[] = [
  {
    id: 1,
    companyName: 'ThemeWagon Inc.',
    companyLogo: themewagonLogo,
    designation: 'UX/UI Designer',
    location: 'Dhaka, Bangladesh',
    startDate: '2023-12-01',
    currentlyWorking: true,
  },
  {
    id: 2,
    companyName: 'MailBluster Inc.',
    companyLogo: mailblusterLogo,
    designation: 'Jr. UX/UI Designer',
    location: 'Dhaka, Bangladesh',
    startDate: '2022-04-01',
    endDate: '2023-11-01',
    currentlyWorking: false,
  },
  {
    id: 3,
    companyName: 'TechNext Ltd.',
    companyLogo: technextLogo,
    designation: 'Intern',
    location: 'Dhaka, Bangladesh',
    startDate: '2021-04-01',
    endDate: '2022-03-01',
    currentlyWorking: false,
  },
];

export const educationHistory: EducationHistory[] = [
  {
    id: 1,
    institutionName: 'Harvard University',
    institutionLogo: harvardLogo,
    subject: 'Human Interaction Design',
    location: 'Sylhet, Bangladesh',
    startDate: '2014-01-01',
    endDate: '2019-12-01',
  },
  {
    id: 2,
    institutionName: 'Notre Dame College',
    institutionLogo: ndcLogo,
    subject: '',
    location: 'Dhaka, Bangladesh',
    startDate: '2012-01-01',
    endDate: '2013-12-01',
  },
];
