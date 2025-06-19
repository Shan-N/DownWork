
import ApplicationClient from "./components/application-client";


interface ProjectParams {
    params: Promise<{ applicationId: string }>
}

export default async function ApplicationPage({ params }: ProjectParams) {
    const { applicationId } = await params;

    return (
        <div>
            <ApplicationClient applicationId={applicationId} />
        </div>
    )
}