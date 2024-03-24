import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
const SignInSignOutButton: React.FC<{isCompact?:boolean}> = ({isCompact}) => {

    const isAuthenticated = true;
    if (isAuthenticated) {
        return <SignOutButton isCompact={isCompact} />;
    } else {
        return <SignInButton />;
    }
}

export default SignInSignOutButton;