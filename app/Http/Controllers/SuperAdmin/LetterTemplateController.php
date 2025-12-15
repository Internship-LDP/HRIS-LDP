<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LetterTemplate;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LetterTemplateController extends Controller
{
    /**
     * List templates as JSON for dialog.
     */
    public function list(Request $request)
    {
        $this->authorizeAccess($request->user());

        $templates = LetterTemplate::with('creator:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (LetterTemplate $template) => [
                'id' => $template->id,
                'name' => $template->name,
                'fileName' => $template->file_name,
                'headerText' => $template->header_text,
                'footerText' => $template->footer_text,
                'logoUrl' => $template->logo_url,
                'isActive' => $template->is_active,
                'createdBy' => $template->creator?->name ?? '-',
                'createdAt' => $template->created_at->format('d M Y H:i'),
            ]);

        return response()->json(['templates' => $templates]);
    }

    /**
     * Download a sample template with all placeholders.
     */
    public function downloadSample(Request $request)
    {
        $this->authorizeAccess($request->user());

        $service = new \App\Services\DispositionWordService();
        $tempFile = $this->generateSampleTemplate();

        return response()->download($tempFile, 'Template_Disposisi_Sample.docx')->deleteFileAfterSend(true);
    }

    /**
     * Generate a sample Word template with placeholders.
     */
    protected function generateSampleTemplate(): string
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        $phpWord->setDefaultFontName('Times New Roman');
        $phpWord->setDefaultFontSize(12);

        $section = $phpWord->addSection([
            'marginTop' => 1440,
            'marginBottom' => 1440,
            'marginLeft' => 1440,
            'marginRight' => 1440,
        ]);

        // === LOGO PLACEHOLDER ===
        $section->addText(
            '${logo}',
            ['size' => 10, 'color' => '666666', 'italic' => true],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );
        $section->addTextBreak(1);

        // === HEADER PLACEHOLDER ===
        $section->addText(
            '${header}',
            ['bold' => true, 'size' => 14],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );
        $section->addTextBreak(1);

        // Horizontal line
        $section->addText(
            '────────────────────────────────────────────────────────────',
            ['size' => 8, 'color' => 'CCCCCC'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );
        $section->addTextBreak(1);

        // === SURAT INFO ===
        $section->addText('Nomor: ${nomor_surat}', ['bold' => true]);
        $section->addText('Tanggal: ${tanggal}');
        $section->addText('Prioritas: ${prioritas}');
        $section->addTextBreak(1);

        $section->addText('Kepada Yth.');
        $section->addText('${penerima}', ['bold' => true]);
        $section->addText('Di Tempat');
        $section->addTextBreak(1);

        $section->addText('Perihal: ${perihal}', ['bold' => true, 'underline' => 'single']);
        $section->addTextBreak(1);

        $section->addText('Dengan hormat,');
        $section->addTextBreak(1);

        // === ISI SURAT ===
        $section->addText('${isi_surat}');
        $section->addTextBreak(2);

        // === DISPOSISI INFO ===
        $section->addText('Catatan Disposisi:', ['bold' => true, 'color' => '0000FF']);
        $section->addText('${catatan_disposisi}', ['italic' => true]);
        $section->addTextBreak(1);

        $section->addText('Status: DIDISPOSISI', ['bold' => true, 'color' => '008000']);
        $section->addText('Tanggal Disposisi: ${tanggal_disposisi}');
        $section->addText('Oleh: ${oleh}');
        $section->addTextBreak(2);

        // === PENGIRIM INFO ===
        $section->addText('Pengirim:');
        $section->addText('${pengirim}', ['bold' => true]);
        $section->addText('Divisi: ${divisi_pengirim}');
        $section->addTextBreak(2);

        // Horizontal line
        $section->addText(
            '────────────────────────────────────────────────────────────',
            ['size' => 8, 'color' => 'CCCCCC'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );

        // === FOOTER PLACEHOLDER ===
        $section->addText(
            '${footer}',
            ['size' => 9, 'italic' => true, 'color' => '888888'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );

        $tempFile = tempnam(sys_get_temp_dir(), 'sample_template_') . '.docx';
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);

        return $tempFile;
    }

    /**
     * Display template management.
     */
    public function index(Request $request): Response
    {
        $this->authorizeAccess($request->user());

        $templates = LetterTemplate::with('creator:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (LetterTemplate $template) => [
                'id' => $template->id,
                'name' => $template->name,
                'fileName' => $template->file_name,
                'isActive' => $template->is_active,
                'createdBy' => $template->creator?->name ?? '-',
                'createdAt' => $template->created_at->format('d M Y H:i'),
            ]);

        $placeholders = LetterTemplate::placeholders();

        return Inertia::render('SuperAdmin/KelolaSurat/Templates', [
            'templates' => $templates,
            'placeholders' => $placeholders,
        ]);
    }

    /**
     * Store a new template.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'template_file' => [
                'required',
                'file',
                'mimetypes:application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'max:5120', // 5MB
            ],
            'header_text' => ['nullable', 'string', 'max:1000'],
            'footer_text' => ['nullable', 'string', 'max:1000'],
            'logo_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5048'], // 5MB
        ]);

        $file = $request->file('template_file');
        $path = $file->store('letter-templates', 'public');

        // Handle logo upload
        $logoPath = null;
        if ($request->hasFile('logo_file')) {
            $logoPath = $request->file('logo_file')->store('letter-templates/logos', 'public');
        }

        LetterTemplate::create([
            'name' => $validated['name'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'header_text' => $validated['header_text'] ?? null,
            'footer_text' => $validated['footer_text'] ?? null,
            'logo_path' => $logoPath,
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        // Deactivate other templates (only one active at a time)
        LetterTemplate::where('is_active', true)
            ->where('file_path', '!=', $path)
            ->update(['is_active' => false]);

        return redirect()
            ->back()
            ->with('success', 'Template berhasil diunggah dan diaktifkan.');
    }

    /**
     * Toggle template active status.
     */
    public function toggleActive(Request $request, LetterTemplate $template): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        if (!$template->is_active) {
            // Deactivate all others first
            LetterTemplate::where('is_active', true)->update(['is_active' => false]);
        }

        $template->update(['is_active' => !$template->is_active]);

        return redirect()
            ->back()
            ->with('success', $template->is_active ? 'Template diaktifkan.' : 'Template dinonaktifkan.');
    }

    /**
     * Delete a template.
     */
    public function destroy(Request $request, LetterTemplate $template): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        // Delete file from storage
        if (Storage::disk('local')->exists($template->file_path)) {
            Storage::disk('local')->delete($template->file_path);
        }

        $template->delete();

        return redirect()
            ->back()
            ->with('success', 'Template berhasil dihapus.');
    }

    /**
     * Download template with header/footer/logo injected.
     */
    public function download(Request $request, LetterTemplate $template)
    {
        $this->authorizeAccess($request->user());

        if (!file_exists($template->full_path)) {
            return response()->json([
                'error' => 'File template tidak ditemukan. Silakan upload ulang.',
                'path' => $template->full_path,
            ], 404);
        }

        // Use TemplateProcessor to inject header/footer/logo
        $templateProcessor = new \PhpOffice\PhpWord\TemplateProcessor($template->full_path);

        // Replace header placeholder
        if ($template->header_text) {
            $templateProcessor->setValue('header', $template->header_text);
        }

        // Replace footer placeholder
        if ($template->footer_text) {
            $templateProcessor->setValue('footer', $template->footer_text);
        }

        // Replace logo placeholder with image if exists
        if ($template->logo_path) {
            $logoFullPath = storage_path('app/public/' . $template->logo_path);
            if (file_exists($logoFullPath)) {
                try {
                    $templateProcessor->setImageValue('logo', [
                        'path' => $logoFullPath,
                        'width' => 150,
                        'height' => 50,
                        'ratio' => true,
                    ]);
                } catch (\Exception $e) {
                    // If image replacement fails, just replace with text
                    $templateProcessor->setValue('logo', '[Logo]');
                }
            } else {
                $templateProcessor->setValue('logo', '');
            }
        } else {
            $templateProcessor->setValue('logo', '');
        }

        // Save to temp file
        $tempFile = tempnam(sys_get_temp_dir(), 'template_preview_') . '.docx';
        $templateProcessor->saveAs($tempFile);

        $filename = 'Preview_' . $template->file_name;

        // Return file download with explicit headers to bypass Inertia
        return response()->file($tempFile, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'X-Vapor-Base64-Encode' => 'True',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Update existing template.
     */
    public function update(Request $request, LetterTemplate $template): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'template_file' => [
                'nullable',
                'file',
                'mimetypes:application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'max:5120', // 5MB
            ],
            'header_text' => ['nullable', 'string', 'max:1000'],
            'footer_text' => ['nullable', 'string', 'max:1000'],
            'logo_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:5048'], // 5MB
            'remove_logo' => ['nullable', 'boolean'],
        ]);

        // Update name and text fields
        $template->name = $validated['name'];
        $template->header_text = $validated['header_text'] ?? null;
        $template->footer_text = $validated['footer_text'] ?? null;

        // Handle template file update
        if ($request->hasFile('template_file')) {
            // Delete old file
            if ($template->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($template->file_path);
            }

            $file = $request->file('template_file');
            $path = $file->store('letter-templates', 'public');
            $template->file_path = $path;
            $template->file_name = $file->getClientOriginalName();
        }

        // Handle logo update or removal
        if ($request->boolean('remove_logo')) {
            // Remove existing logo
            if ($template->logo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($template->logo_path);
                $template->logo_path = null;
            }
        } elseif ($request->hasFile('logo_file')) {
            // Delete old logo if exists
            if ($template->logo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($template->logo_path);
            }
            $template->logo_path = $request->file('logo_file')->store('letter-templates/logos', 'public');
        }

        $template->save();

        return redirect()
            ->back()
            ->with('success', 'Template berhasil diperbarui.');
    }

    private function authorizeAccess(?User $user): void
    {
        abort_unless(
            $user
            && (
                $user->role === User::ROLES['super_admin']
                || $user->isHumanCapitalAdmin()
            ),
            403
        );
    }
}
