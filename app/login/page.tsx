
import { LoginForm } from "./components/login-form";


const LoginPage = () => {
    return (
        <div className="flex h-screen w-full">
            <LoginForm className="dark md:max-w-1/2" />
             {/* <span className="flex flex-row font-bold text-xl justify-center tracking-wider text-white"><MoveDown className="size-5"/>Work</span> */}
        </div>
    )
}

export default LoginPage;