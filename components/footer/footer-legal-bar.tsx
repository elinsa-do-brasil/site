export function FooterLegalBar() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-3 pb-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <p>
        &copy; {currentYear} Elinsa - Eletrotécnica Industrial e Naval do
        Brasil.
      </p>
      <p>Conteúdo institucional e identidade visual protegidos.</p>
    </div>
  );
}
