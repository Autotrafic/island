import { CheckCircleTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import {
  DocumentCheckIcon,
  LightBulbIcon as HeroicLightBulbIcon,
  HomeIcon as HeroicHomeIcon,
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCity, faHashtag } from '@fortawesome/free-solid-svg-icons';

export const CheckGreenIcon = <CheckCircleTwoTone twoToneColor="#52c41a" />;

export const InfoGreyIcon = <InfoCircleTwoTone />;

export const DocumentVisibleIcon = <DocumentCheckIcon className="text-gray-700 w-5 h-5" />;

export const LightBulbIcon = <HeroicLightBulbIcon className="text-gray-700 w-5 h-5" />;

export const HomeIcon = <HeroicHomeIcon className="text-gray-700 w-5 h-5" />;

export const CityIcon = <FontAwesomeIcon icon={faCity} className="text-gray-700 w-5 h-5" />;

export const PostalCodeIcon = <FontAwesomeIcon icon={faHashtag} className="text-gray-700 w-5 h-5" />;