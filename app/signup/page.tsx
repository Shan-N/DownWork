import SignupForm from "./components/signup-form";


const SignupPage = () => {
    return (
        <div className="flex md:justify-end h-screen w-full">
            <SignupForm className="dark md:max-w-1/2" />
        </div>
    )
}

export default SignupPage;