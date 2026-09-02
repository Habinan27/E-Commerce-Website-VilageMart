/**
 * Real-time event utilities for shopping cart and wishlist
 */

export function getStoredCartCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem('vm_cart_count');
  return count ? parseInt(count, 10) : 0;
}

export function getStoredWishlistCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem('vm_wishlist_count');
  return count ? parseInt(count, 10) : 0;
}

export function notifyCartUpdate(newCount?: number) {
  if (typeof window === 'undefined') return;
  let count = newCount;
  if (typeof count !== 'number') {
    count = getStoredCartCount() + 1;
  }
  localStorage.setItem('vm_cart_count', count.toString());
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count } }));
}

export function notifyWishlistUpdate(newCount: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('vm_wishlist_count', newCount.toString());
  window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { count: newCount } }));
}
