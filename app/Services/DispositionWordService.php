<?php

namespace App\Services;

use App\Models\LetterTemplate;
use App\Models\Surat;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\SimpleType\Jc;

class DispositionWordService
{
    /**
     * Generate a Word document for the given letter.
     * Uses custom template if available, otherwise generates default.
     *
     * @param Surat $surat
     * @param LetterTemplate|null $template
     * @return string Path to the temporary file
     */
    public function generate(Surat $surat, ?LetterTemplate $template = null): string
    {
        // If custom template provided, use it
        if ($template && file_exists($template->full_path)) {
            return $this->generateFromTemplate($surat, $template);
        }

        // Check for active template
        $activeTemplate = LetterTemplate::where('is_active', true)->first();
        if ($activeTemplate && file_exists($activeTemplate->full_path)) {
            return $this->generateFromTemplate($surat, $activeTemplate);
        }

        // Fallback to default generation
        return $this->generateDefault($surat);
    }

    /**
     * Generate Word document from custom template with placeholder replacement.
     */
    protected function generateFromTemplate(Surat $surat, LetterTemplate $template): string
    {
        $templateProcessor = new TemplateProcessor($template->full_path);

        // Get replacement values
        $replacements = $this->getPlaceholderValues($surat);

        // Replace all placeholders
        foreach ($replacements as $placeholder => $value) {
            $key = str_replace(['{{', '}}'], '', $placeholder);
            $templateProcessor->setValue($key, $value ?? '-');
        }

        // Save to temp file
        $tempFile = tempnam(sys_get_temp_dir(), 'disposition_') . '.docx';
        $templateProcessor->saveAs($tempFile);

        return $tempFile;
    }

    /**
     * Get placeholder values from Surat model.
     */
    public function getPlaceholderValues(Surat $surat): array
    {
        $surat->load(['user', 'departemen', 'disposer']);

        return [
            '{{nomor_surat}}' => $surat->nomor_surat ?? '-',
            '{{tanggal}}' => optional($surat->tanggal_surat)->format('d F Y') ?? '-',
            '{{pengirim}}' => $surat->user?->name ?? ($surat->alamat_pengirim ?? '-'),
            '{{divisi_pengirim}}' => $surat->user?->division ?? ($surat->departemen?->nama_departemen ?? '-'),
            '{{penerima}}' => $surat->target_division ?? $surat->penerima ?? '-',
            '{{perihal}}' => $surat->perihal ?? '-',
            '{{isi_surat}}' => $surat->isi_surat ?? '-',
            '{{prioritas}}' => ucfirst($surat->prioritas ?? '-'),
            '{{catatan_disposisi}}' => $surat->disposition_note ?? '-',
            '{{tanggal_disposisi}}' => optional($surat->disposed_at)->format('d F Y H:i') ?? '-',
            '{{oleh}}' => $surat->disposer?->name ?? 'HR Admin',
        ];
    }

    /**
     * Generate default Word document without template.
     */
    protected function generateDefault(Surat $surat): string
    {
        $phpWord = new PhpWord();

        // Set default font
        $phpWord->setDefaultFontName('Times New Roman');
        $phpWord->setDefaultFontSize(12);

        // Add section
        $section = $phpWord->addSection([
            'marginTop' => 1440,
            'marginBottom' => 1440,
            'marginLeft' => 1440,
            'marginRight' => 1440,
        ]);

        // Header - Company Name
        $section->addText(
            'PT. LINTAS DAYA PRIMA',
            ['bold' => true, 'size' => 16],
            ['alignment' => Jc::CENTER]
        );
        $section->addText(
            'Jl. Contoh Alamat No. 123, Jakarta',
            ['size' => 10],
            ['alignment' => Jc::CENTER]
        );
        $section->addTextBreak(1);

        // Letter Number and Date
        $section->addText(
            'Nomor: ' . $surat->nomor_surat,
            ['bold' => true]
        );
        $section->addText(
            'Tanggal: ' . optional($surat->tanggal_surat)->format('d F Y')
        );
        $section->addText(
            'Prioritas: ' . ucfirst($surat->prioritas ?? '-')
        );
        $section->addTextBreak(1);

        // Recipient
        $section->addText('Kepada Yth.');
        $section->addText(
            ($surat->target_division ?? $surat->penerima ?? '-'),
            ['bold' => true]
        );
        $section->addText('Di Tempat');
        $section->addTextBreak(1);

        // Subject
        $section->addText(
            'Perihal: ' . ($surat->perihal ?? '-'),
            ['bold' => true, 'underline' => 'single']
        );
        $section->addTextBreak(1);

        // Content
        $section->addText('Dengan hormat,');
        $section->addTextBreak(1);
        
        // Letter content - handle multiline text
        $content = $surat->isi_surat ?? '-';
        $contentLines = explode("\n", $content);
        foreach ($contentLines as $line) {
            $section->addText(
                trim($line),
                [],
                ['alignment' => Jc::BOTH]
            );
        }
        $section->addTextBreak(2);

        // Disposition Note if exists
        if ($surat->disposition_note) {
            $section->addText(
                'Catatan Disposisi:',
                ['bold' => true, 'color' => '0000FF']
            );
            $section->addText(
                $surat->disposition_note,
                ['italic' => true]
            );
            $section->addTextBreak(1);
        }

        // Disposition Info
        $section->addText(
            'Status: DIDISPOSISI (FINAL)',
            ['bold' => true, 'color' => '008000']
        );
        $section->addText(
            'Tanggal Disposisi: ' . optional($surat->disposed_at)->format('d F Y H:i')
        );
        
        // Get disposer name
        $disposerName = $surat->disposer?->name ?? 'HR Admin';
        $section->addText('Oleh: ' . $disposerName);
        $section->addTextBreak(2);

        // Sender Info
        $section->addText('Pengirim:');
        $section->addText(
            $surat->user?->name ?? ($surat->alamat_pengirim ?? '-'),
            ['bold' => true]
        );
        if ($surat->departemen) {
            $section->addText('Divisi: ' . $surat->departemen->nama_departemen);
        }
        $section->addTextBreak(2);

        // Footer note
        $section->addText(
            'Dokumen ini telah didisposisi dan bersifat final. Tidak dapat dibalas.',
            ['size' => 9, 'italic' => true, 'color' => '888888'],
            ['alignment' => Jc::CENTER]
        );

        // Save to temp file
        $tempFile = tempnam(sys_get_temp_dir(), 'disposition_') . '.docx';
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);

        return $tempFile;
    }

    /**
     * Generate filename for the disposition document.
     */
    public function getFilename(Surat $surat): string
    {
        $number = str_replace(['/', '\\'], '-', $surat->nomor_surat ?? 'surat');
        return "Disposisi_Final_{$number}.docx";
    }
}
