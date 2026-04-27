import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-4">✓</div>
      <h1 className="font-display text-3xl mb-3">Paiement reçu</h1>
      <p className="text-sm text-black/70 mb-8">
        Merci. Votre réservation est confirmée. Vous recevrez un email avec
        toutes les informations pour la remise de la pièce.
      </p>
      <Link
        href="/"
        className="inline-block bg-[var(--color-primary)] text-white px-6 py-2.5 text-sm uppercase tracking-wider"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
