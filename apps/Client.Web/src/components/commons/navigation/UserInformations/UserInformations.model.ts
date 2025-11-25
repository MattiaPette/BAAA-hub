import { SidebarRoute } from '../Sidebar/Sidebar.model';

export type UserInformationsProps = Readonly<{
  name: string;
  surname: string;
  email: string;
  userRoles: string[];
  pictureSrc?: string;
  open: boolean;
  userRoutes: ReadonlyArray<SidebarRoute>;
  onAvatarClick?: () => void;
}>;
