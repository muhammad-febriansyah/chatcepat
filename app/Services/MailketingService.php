<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailketingService
{
    public function send($recipient, $subject, $content, $templateKey = null)
    {
        $apiToken = Setting::get('mailketing_api_token');
        $fromEmail = Setting::get('mailketing_from_email');
        $siteName = Setting::get('site_name', 'ChatCepat');

        if (!$apiToken || !$fromEmail) {
            Log::warning('Mailketing credentials not set. Email not sent.');
            return false;
        }

        // If templateKey is provided, we can fetch and replace variables here if needed
        // but for now, we assume the content is already prepared or we provide a helper

        $payload = [
            'api_token' => $apiToken,
            'from_name' => $siteName,
            'from_email' => $fromEmail,
            'recipient' => $recipient,
            'subject' => $subject,
            'content' => $this->wrapWithLayout($content, $subject),
        ];

        try {
            $response = Http::asForm()->post('https://api.mailketing.co.id/api/v1/send', $payload);
            $result = $response->json();

            Log::info('Mailketing API Attempt', [
                'recipient' => $recipient,
                'from_email' => $fromEmail,
                'subject' => $subject,
                'status' => $response->status(),
                'result' => $result
            ]);

            return $response->successful() && ($result['status'] ?? '') === 'success';
        } catch (\Exception $e) {
            Log::error('Mailketing API Error: ' . $e->getMessage());
            return false;
        }
    }

    public function wrapWithLayout($content, $subject)
    {
        $siteName = Setting::get('site_name', 'ChatCepat');
        $siteLogo = Setting::get('logo');
        $companyName = Setting::get('footer_company_name', $siteName);
        $address = Setting::get('footer_address', Setting::get('address', 'Indonesia'));
        $primaryColor = '#2547F9';

        // High-res Social Icons (Standard URLs) - Perfectly Sharp in Primary Color
        $socialIcons = [
            'facebook' => 'https://img.icons8.com/color/48/facebook-new.png',
            'instagram' => 'https://img.icons8.com/color/48/instagram-new.png',
            'twitter' => 'https://img.icons8.com/color/48/twitterx--v2.png',
            'youtube' => 'https://img.icons8.com/color/48/youtube-play.png',
            'tiktok' => 'https://img.icons8.com/color/48/tiktok.png',
        ];

        $socialHtml = '';
        foreach ($socialIcons as $platform => $icon) {
            $url = Setting::get($platform . '_url');
            if ($url) {
                $socialHtml .= '<a href="' . $url . '" style="margin-right: 12px; text-decoration: none;"><img src="' . $icon . '" alt="' . $platform . '" width="24" height="24" style="display: inline-block; border: 0;"></a>';
            }
        }

        // Always use the logo image from chatcepat.png
        $logoUrl = url('chatcepat.png');
        $logoHtml = '<img src="' . $logoUrl . '" alt="' . $siteName . '" style="max-height: 50px; width: auto; margin-bottom: 5px;">';

        return '
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>' . htmlspecialchars($subject) . '</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 40px 0 30px 0;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0,0,0,0.03);">
                            <tr>
                                <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid #f0f0f0;">
                                    ' . $logoHtml . '
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px 40px 30px; color: #333333; font-family: sans-serif; font-size: 16px; line-height: 24px;">
                                    ' . $content . '
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px 30px 30px 30px; background-color: #ffffff; border-top: 1px solid #f0f0f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="left" style="color: #666666; font-family: sans-serif; font-size: 14px; padding-bottom: 12px; font-weight: bold;">
                                                Follow Us
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="padding-bottom: 25px;">
                                                ' . $socialHtml . '
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="color: #666666; font-family: sans-serif; font-size: 12px; text-align: left; line-height: 1.6; border-top: 1px solid #eeeeee; padding-top: 20px;">
                                                &copy; ' . date('Y') . ' ' . htmlspecialchars($companyName) . '. All Rights Reserved.<br/>
                                                <span style="color: #999999;">' . nl2br(htmlspecialchars($address)) . '</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>';
    }
}
