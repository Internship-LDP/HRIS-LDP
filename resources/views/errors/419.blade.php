<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="overflow-x-hidden">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Sesi Berakhir</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=poppins:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- Tailwind -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gradient-to-br from-slate-50 to-slate-200 font-[Poppins] antialiased">

    <div class="min-h-screen flex items-center justify-center px-6">
        <div class="bg-white shadow-2xl rounded-2xl p-10 max-w-md w-full text-center border border-slate-100">

            <!-- Icon -->
            <div class="mx-auto mb-6 w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     fill="none" viewBox="0 0 24 24" 
                     stroke-width="1.7" 
                     stroke="#2563eb" 
                     class="w-12 h-12">
                    <path stroke-linecap="round" stroke-linejoin="round" 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <!-- Title -->
            <h1 class="text-2xl font-bold text-slate-800 mb-2">
                Sesi Berakhir
            </h1>

            <!-- Subtitle -->
            <p class="text-slate-600 mb-8 leading-relaxed">
                Demi keamanan, sesi Anda telah berakhir.  
                Silakan masuk kembali untuk melanjutkan.
            </p>

            <!-- Button -->
            <a href="{{ route('login') }}"
               class="block px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow">
                Masuk Kembali
            </a>
        </div>
    </div>

</body>
</html>
