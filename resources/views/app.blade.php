<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="overflow-x-hidden">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Lintas Data Prima HRIS') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600|poppins:400,600,700|mulish:200,300,400,500,600,700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="{{ asset('img/LogoLDP.png') }}">

        <!-- Scripts -->
        @routes
        <style>
            html,
            body {
                width: 100%;
                max-width: 100vw;
                overflow-x: hidden;
                background-color: #05070f;
            }
            html {
                overflow-y: auto;
            }
            body {
                overflow-y: auto;
            }
        </style>
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased overflow-x-hidden max-w-full">
        @inertia
    </body>
</html>
