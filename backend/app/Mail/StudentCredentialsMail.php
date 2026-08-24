<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $studentName;
    public string $email;
    public string $loginId;
    public string $password;
    public string $courseLevel;

    /**
     * Create a new message instance.
     */
    public function __construct(string $studentName, string $email, string $loginId, string $password, string $courseLevel = 'ilanilai')
    {
        $this->studentName = $studentName;
        $this->email       = $email;
        $this->loginId     = $loginId;
        $this->password    = $password;
        $this->courseLevel = $courseLevel;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'ஆருத்ரா ஜோதிட பயிலரங்கம் - உங்கள் உள்நுழைவு விவரங்கள் (Login Credentials)',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtmlString(),
        );
    }

    private function buildHtmlString(): string
    {
        $levelName = ($this->courseLevel === 'mudhunilai') ? 'முதுநிலை (Senior)' : 'இளநிலை (Junior)';

        return "
        <div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f3eb; padding: 20px; color: #2d1b08;\">
            <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #ecc876; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">
                <div style=\"background: linear-gradient(135deg, #4A0E17 0%, #200438 100%); padding: 30px; text-align: center; color: #ffffff;\">
                    <h1 style=\"margin: 0; font-size: 26px; color: #ecc876;\">ஆருத்ரா ஜோதிட பயிலரங்கம்</h1>
                    <p style=\"margin: 5px 0 0 0; font-size: 14px; color: #f0e6d2;\">Arudra Astrology Academy</p>
                </div>
                <div style=\"padding: 30px;\">
                    <h2 style=\"color: #4A0E17; font-size: 20px; margin-top: 0;\">வணக்கம் {$this->studentName},</h2>
                    <p style=\"font-size: 15px; line-height: 1.6;\">
                        ஆருத்ரா ஜோதிட பயிலரங்கத்தில் <strong>{$levelName}</strong> வகுப்பிற்கு உங்கள் சேர்க்கை வெற்றிகரமாக முடிந்தது! 
                        உங்கள் படிப்பைத் தொடங்குவதற்கான உள்நுழைவு விவரங்கள் கீழே கொடுக்கப்பட்டுள்ளன:
                    </p>
                    <div style=\"background-color: #fff9ed; border-left: 4px solid #a27b38; padding: 15px 20px; margin: 20px 0; border-radius: 6px;\">
                        <p style=\"margin: 5px 0; font-size: 15px;\"><strong>பயனர் ஐடி (User ID / Login ID):</strong> <span style=\"color: #4A0E17; font-weight: bold;\">{$this->loginId}</span></p>
                        <p style=\"margin: 5px 0; font-size: 15px;\"><strong>மின்னஞ்சல் (Email):</strong> {$this->email}</p>
                        <p style=\"margin: 5px 0; font-size: 15px;\"><strong>கடவுச்சொல் (Password):</strong> <span style=\"color: #4A0E17; font-weight: bold;\">{$this->password}</span></p>
                    </div>
                    <p style=\"font-size: 14px; color: #555;\">
                        செயலி அல்லது இணைய தளத்தின் மாணவர் உள்நுழைவு (Student Login) பகுதிக்கு சென்று மேலே உள்ள பயனர் ஐடி மற்றும் கடவுச்சொல்லை உள்ளிட்டு உங்கள் பாடங்களை படிக்கத் தொடங்கலாம்.
                    </p>
                    <div style=\"text-align: center; margin-top: 30px;\">
                        <span style=\"display: inline-block; background-color: #4A0E17; color: #ffffff; padding: 12px 25px; border-radius: 25px; font-weight: bold; text-decoration: none;\">
                            வாழ்த்துக்களுடன், ஆருத்ரா நிர்வாகம்
                        </span>
                    </div>
                </div>
                <div style=\"background-color: #f7f3eb; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;\">
                    இது தானியங்கி மின்னஞ்சல். தயவுசெய்து இதற்கு பதில் அனுப்ப வேண்டாம்.
                </div>
            </div>
        </div>
        ";
    }
}
