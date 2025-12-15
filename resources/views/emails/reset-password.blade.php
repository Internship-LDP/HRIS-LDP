<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 20px;
        }
        .message {
            color: #555555;
            margin-bottom: 25px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
        }
        .button:hover {
            opacity: 0.9;
        }
        .expire-notice {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .expire-notice strong {
            color: #664d03;
        }
        .ignore-notice {
            color: #6c757d;
            font-size: 14px;
            margin-top: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 13px;
            border-top: 1px solid #e9ecef;
        }
        .url-fallback {
            margin-top: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            font-size: 13px;
            color: #6c757d;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ config('app.name') }}</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Halo, {{ $user->name ?? 'Pengguna' }}!</p>
            
            <p class="message">
                Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda di <strong>{{ config('app.name') }}</strong>.
            </p>
            
            <div class="button-container">
                <a href="{{ $url }}" class="button">Reset Password</a>
            </div>
            
            <div class="expire-notice">
                <strong>⏰ Perhatian:</strong> Link reset password ini akan kadaluarsa dalam <strong>{{ $expireMinutes }} menit</strong>.
            </div>
            
            <p class="ignore-notice">
                Jika Anda tidak meminta reset password, Anda tidak perlu melakukan apapun. Password Anda akan tetap aman dan tidak berubah.
            </p>
            
            <div class="url-fallback">
                <strong>Jika tombol tidak berfungsi</strong>, salin dan tempel URL berikut ke browser Anda:<br>
                <a href="{{ $url }}" style="color: #667eea;">{{ $url }}</a>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
        </div>
    </div>
</body>
</html>
