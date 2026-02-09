import { AccountTab } from 'types/accounts';
import PersonalInfoTabPanel from 'components/sections/account/personal-info/PersonalInfoTabPanel';
import TouchIDTabPanel from 'components/sections/account/touch-id/TouchIdTabPanel';

export const accountTabs: AccountTab[] = [
  {
    id: 1,
    label: 'Personal Information',
    title: 'Personal Info',
    value: 'personal_information',
    icon: 'material-symbols:person-outline',
    panelIcon: 'material-symbols:person-outline',
    tabPanel: <PersonalInfoTabPanel />,
  },
  {
    id: 12,
    label: 'Configure MFA',
    title: 'Configure MFA',
    value: 'touch_id',
    icon: 'material-symbols:touch-app-outline',
    panelIcon: 'material-symbols:touch-app-outline',
    tabPanel: <TouchIDTabPanel />,
  },
];
