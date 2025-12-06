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

        $section->addText(
            'PT. LINTAS DAYA PRIMA',
            ['bold' => true, 'size' => 16],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );
        $section->addText(
            'Jl. Alamat Perusahaan, Kota',
            ['size' => 10],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );
        $section->addTextBreak(2);

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

        $section->addText('${isi_surat}');
        $section->addTextBreak(2);

        $section->addText('Catatan Disposisi:', ['bold' => true, 'color' => '0000FF']);
        $section->addText('${catatan_disposisi}', ['italic' => true]);
        $section->addTextBreak(1);

        $section->addText('Status: DIDISPOSISI', ['bold' => true, 'color' => '008000']);
        $section->addText('Tanggal Disposisi: ${tanggal_disposisi}');
        $section->addText('Oleh: ${oleh}');
        $section->addTextBreak(2);

        $section->addText('Pengirim:');
        $section->addText('${pengirim}', ['bold' => true]);
        $section->addText('Divisi: ${divisi_pengirim}');
        $section->addTextBreak(2);

        $section->addText(
            'Dokumen ini telah didisposisi dan bersifat final.',
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
        ]);

        $file = $request->file('template_file');
        $path = $file->store('letter-templates', 'local');

        LetterTemplate::create([
            'name' => $validated['name'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
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
     * Download template for reference.
     */
    public function download(Request $request, LetterTemplate $template)
    {
        $this->authorizeAccess($request->user());

        if (!file_exists($template->full_path)) {
            return redirect()->back()->with('error', 'File template tidak ditemukan.');
        }

        return response()->download($template->full_path, $template->file_name);
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
