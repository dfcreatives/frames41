import Icon from '../ui/Icon'

interface ProductActionsProps {
  showPhotoCustomization?: boolean
  photo?: File | null
  photoPreview?: string
  wishes?: string
  customizationError?: string
  onPhotoChange?: (file: File | null) => void
  onWishesChange?: (value: string) => void
  quantity: number
  isWishlisted: boolean
  shippingNote: string
  shippingDuration: string
  cartStatus?: 'idle' | 'adding' | 'added'
  onIncrement: () => void
  onDecrement: () => void
  onAddToCart: () => void
  onWishlistToggle: () => void
}

export default function ProductActions({
  showPhotoCustomization = false,
  photo,
  photoPreview,
  wishes = '',
  customizationError,
  onPhotoChange,
  onWishesChange,
  quantity,
  isWishlisted,
  shippingNote,
  shippingDuration,
  cartStatus = 'idle',
  onIncrement,
  onDecrement,
  onAddToCart,
  onWishlistToggle,
}: ProductActionsProps) {
  const btnText =
    cartStatus === 'adding' ? 'Adding…'
    : cartStatus === 'added' ? 'Added'
    : 'Add to Cart'

  return (
    <div className="flex flex-col gap-4">
      {showPhotoCustomization && (
        <section className="rounded-xl border border-outline-variant bg-white p-4 sm:p-5" aria-labelledby="frame-customization-heading">
          <h2 id="frame-customization-heading" className="font-bold text-on-background">
            Personalise your photo frame
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">Upload the photo to be printed in your frame.</p>

          <label className="mt-4 block text-sm font-bold text-on-background" htmlFor="frame-photo">
            Photo <span className="text-error" aria-hidden="true">*</span>
          </label>
          <input
            id="frame-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            aria-invalid={Boolean(customizationError)}
            aria-describedby={customizationError ? 'frame-photo-error' : 'frame-photo-help'}
            onChange={(event) => onPhotoChange?.(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full rounded-lg border border-outline-variant p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-bold file:text-primary"
          />
          <p id="frame-photo-help" className="mt-1 text-xs text-on-surface-variant">JPEG, PNG or WebP, up to 200 MB.</p>
          {photo && <p className="mt-2 truncate text-xs font-medium text-primary">Selected: {photo.name}</p>}
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview of your selected frame photo"
              className="mt-3 h-32 w-32 rounded-lg border border-outline-variant object-cover"
            />
          )}
          {customizationError && <p id="frame-photo-error" role="alert" className="mt-2 text-sm text-error">{customizationError}</p>}

          <label className="mt-4 block text-sm font-bold text-on-background" htmlFor="frame-wishes">
            Text or wishes <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <textarea
            id="frame-wishes"
            value={wishes}
            maxLength={300}
            rows={3}
            placeholder="Add a name, date, message or special wishes"
            onChange={(event) => onWishesChange?.(event.target.value)}
            className="mt-2 w-full resize-y rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </section>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div
          role="group"
          aria-label="Product quantity"
          className="flex items-center border border-outline-variant rounded px-2 bg-white self-start"
        >
          <button
            type="button"
            onClick={onDecrement}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="p-2 text-on-background hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="remove" />
          </button>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="px-4 sm:px-6 font-bold text-on-background select-none min-w-[3rem] text-center"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            aria-label="Increase quantity"
            className="p-2 text-on-background hover:text-primary transition-colors"
          >
            <Icon name="add" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={cartStatus === 'adding'}
          className="flex-1 bg-primary text-white py-3 sm:py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 active:translate-y-[1px] transition-all shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-60 text-sm sm:text-base whitespace-nowrap"
        >
          <Icon name="shopping_bag" />
          {btnText}
        </button>

        <button
          type="button"
          onClick={onWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          className="aspect-square border border-outline-variant rounded flex items-center justify-center px-4 hover:bg-white hover:text-error transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error self-start sm:self-auto"
        >
          <Icon name="favorite" filled={isWishlisted} className={isWishlisted ? 'text-error' : ''} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-4 sm:p-5 bg-white border border-outline-variant rounded-lg">
        <div className="flex items-center gap-3 sm:gap-4">
          <Icon name="local_shipping" className="text-primary shrink-0" aria-hidden="true" />
          <span className="text-sm sm:text-body-md font-bold uppercase tracking-tight">{shippingNote}</span>
        </div>
        <span className="text-xs text-outline font-bold uppercase">{shippingDuration}</span>
      </div>
    </div>
  )
}
