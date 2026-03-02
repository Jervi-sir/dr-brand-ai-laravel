import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard } from '@/routes';
import chat from '@/routes/chat';

export default function Error({ status }: { status: number }) {
  const title = {
    503: '503: Service Unavailable',
    500: '500: Server Error',
    404: '404: Page Not Found',
    403: '403: Forbidden',
  }[status] || 'Error';

  const description = {
    503: 'Sorry, we are doing some maintenance. Please check back soon.',
    500: 'Whoops, something went wrong on our servers.',
    404: 'Sorry, the page you are looking for could not be found.',
    403: 'Sorry, you are forbidden from accessing this page.',
  }[status] || 'An unexpected error has occurred.';

  return (
    <>
      <Head title={title} />
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
        <div className="w-full max-w-md text-center">
          {/* <div className="mb-8 flex justify-center">
            <AppLogoIcon className="h-12 w-12 fill-[#f53003] dark:fill-[#FF4433]" />
          </div> */}

          <h1 className="mb-2 text-4xl font-semibold tracking-tight">
            {status}
          </h1>
          <h2 className="mb-4 text-xl font-medium text-[#706f6c] dark:text-[#A1A09A]">
            {title}
          </h2>
          <p className="mb-8 text-sm text-[#706f6c] dark:text-[#A1A09A]">
            {description}
          </p>

          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/">
                Return Home
              </Link>
            </Button>
            <Button asChild>
              <Link href={chat.index().url}>
                View Main Page
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
