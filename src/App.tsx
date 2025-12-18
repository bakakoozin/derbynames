import { Router, A } from '@solidjs/router';
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { Logo } from '~/components/logo';
import { Menu } from '~/components/Menu';
import { ToastContainer } from './ui/Toast';
import { Meta, MetaProvider, Title } from '@solidjs/meta'


export default function App() {
  return (
    <Router
      root={(props: any) => (
        <>
          <MetaProvider>

            <Title>Derby Names</Title>
            <Meta name="author" content="Derby Names" />
            <Meta name="robots" content="index, follow" />
            <Meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <Meta name="generator" content="Derby Names" />
            <Meta name="theme-color" content="#000000" />
            <Meta name="apple-mobile-web-app-capable" content="yes" />
            <Meta name="apple-mobile-web-app-status-bar-style" content="black" />
          </MetaProvider>
          <ToastContainer />

          <div class='bg-dn-100 text-600 w-full h-[100dvh] grid grid-rows-[auto_1fr]'>
            <header class="flex py-2 pr-2 pl-12 md:pl-2  place-items-center place-content-between ">
              <A href="/">
                <Logo />
              </A>
            </header>
            <main class="md:grid md:grid-cols-[minmax(200px,15vw)_1fr]">
              <Menu />
              <div class="relative h-full w-full">
                <div class="absolute inset-0 overflow-y-auto z-10">
                  <Suspense>{props.children}</Suspense>
                </div>
              </div>
            </main>
          </div>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
