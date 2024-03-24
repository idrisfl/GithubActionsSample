import { NJSidebarItem } from "@engie-group/fluid-design-system-react";
import { useEffect, useState } from "react";
import { getAuthUserInfo } from "../utils/restApiCalls";
import { IUserInfo } from "../model";

export const SignOutButton: React.FC<{ isCompact?: boolean }> = ({
  isCompact,
}) => {
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getAuthUserInfo();
        setUserInfo(response);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const name = userInfo?.user_claims?.find(claim => claim.typ === 'name')?.val ?? "";
  const logout = async () => window.location.href = window.location.origin + "/.auth/logout";

  return (
    <>
      {!isCompact && (
        <NJSidebarItem
          isClickable={false}
          type="list"
          isFolded={isCompact}
          icon={{ name: "account_circle" }}
        >
          {name}
        </NJSidebarItem>
      )}
      <NJSidebarItem
        icon={{
          name: "power_settings_new",
        }}
        onClickItem={() => logout()}
        isClickable={false}
        type="button"
        hasRightBorder={true}
        noActiveBorder={true}
        rightContent={<span>test</span>}
      >
        Logout
      </NJSidebarItem>
    </>
  );
};
