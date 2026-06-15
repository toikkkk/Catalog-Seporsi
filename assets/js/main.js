document.addEventListener("DOMContentLoaded", () => {
    // 1. Intro Animation
    const overlay = document.getElementById("introOverlay");
    const content = document.getElementById("introContent");
    const reveals = document.querySelectorAll(".animate-reveal");
    const mainReveals = document.querySelectorAll(".main-content-reveal");

    if (overlay && content) {
        setTimeout(() => {
            content.classList.add("animate");
        }, 100);

        setTimeout(() => {
            overlay.classList.add("fade-out");

            setTimeout(() => {
                mainReveals.forEach(el => el.classList.add("visible"));
                reveals.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add("visible");
                    }, index * 100);
                });
            }, 300);
        }, 2600);

        setTimeout(() => {
            overlay.remove();
        }, 3500);
    } else {
        mainReveals.forEach(el => el.classList.add("visible"));
        reveals.forEach(el => el.classList.add("visible"));
    }

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));

    // Helper: Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number).replace('Rp', 'Rp ');
    };

    // ==========================================
    // STATE & MANAJEMEN KERANJANG (CART STATE)
    // ==========================================
    let cart = JSON.parse(localStorage.getItem('seporsi_cart') || '[]');

    const saveCart = () => {
        localStorage.setItem('seporsi_cart', JSON.stringify(cart));
    };

    // Hitung diskon progresif kelipatan 5% untuk setiap 2 item
    const calculateCartDiscount = () => {
        const originalTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        const uniqueCount = cart.length; // Jumlah menu unik berbeda

        // Diskon kelipatan 5% per 2 item (maksimal 25%) berlaku untuk total kuantitas apapun
        let discountPercent = 0;
        if (totalQty >= 2 && totalQty % 2 === 0) {
            discountPercent = (totalQty / 2) * 0.05;
        }

        const discountAmount = Math.round(originalTotal * discountPercent);
        const finalTotal = originalTotal - discountAmount;

        return {
            originalTotal,
            totalQty,
            uniqueCount,
            discountPercent,
            discountAmount,
            finalTotal
        };
    };

    // Update Floating Cart Button & Badge
    const updateFloatingCartBtn = () => {
        const btn = document.getElementById('floatingCartBtn');
        const badge = document.getElementById('cartBadge');
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

        if (totalQty > 0) {
            badge.textContent = totalQty;
            btn.classList.remove('hidden');
            setTimeout(() => {
                btn.classList.remove('translate-y-10', 'opacity-0');
            }, 50);
        } else {
            btn.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => {
                btn.classList.add('hidden');
            }, 300);
        }
    };

    // Render items inside the Cart modal list
    const updateCartUI = () => {
        const container = document.getElementById('cartItemsContainer');
        const originalPriceEl = document.getElementById('cartOriginalPrice');
        const discountLabelEl = document.getElementById('cartDiscountLabel');
        const totalPriceEl = document.getElementById('cartTotalPrice');
        const promoBanner = document.getElementById('cartPromoBanner');

        updateFloatingCartBtn();

        if (cart.length === 0) {
            container.innerHTML = `<p class="text-body-md text-on-surface-variant text-center py-sm">Keranjang Anda kosong.</p>`;
            originalPriceEl.classList.add('hidden');
            discountLabelEl.classList.add('hidden');
            totalPriceEl.textContent = formatRupiah(0);
            promoBanner.classList.add('hidden');
            return;
        }

        // Generate Cart HTML
        container.innerHTML = cart.map(item => `
            <div class="flex items-center justify-between bg-surface-container rounded-lg p-sm tactile-border border-[1.5px] border-[#5a413c] mb-sm">
                <div class="flex-1 min-w-0 pr-sm">
                    <p class="text-body-md font-bold text-on-surface truncate">${item.name}</p>
                    <p class="text-label-md text-on-surface-variant">${formatRupiah(item.price)} / pack</p>
                </div>
                <div class="flex items-center gap-xs">
                    <div class="flex items-center gap-sm bg-surface rounded-md p-xs border border-[#5a413c]">
                        <button class="cart-qty-minus w-6 h-6 flex items-center justify-center bg-surface-container rounded-sm hover:bg-surface-variant transition-colors" data-name="${item.name}">
                            <span class="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span class="text-label-md font-bold w-6 text-center">${item.qty}</span>
                        <button class="cart-qty-plus w-6 h-6 flex items-center justify-center bg-surface-container rounded-sm hover:bg-surface-variant transition-colors" data-name="${item.name}">
                            <span class="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    </div>
                    <button class="cart-item-remove text-on-surface-variant hover:text-primary p-xs transition-colors" data-name="${item.name}">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to quantities and removes in cart
        document.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const item = cart.find(i => i.name === name);
                if (item) {
                    updateCartQty(name, item.qty - 1);
                }
            });
        });

        document.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const item = cart.find(i => i.name === name);
                if (item) {
                    updateCartQty(name, item.qty + 1);
                }
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(btn.dataset.name);
            });
        });

        // Calculate pricing
        const { originalTotal, totalQty, discountPercent, discountAmount, finalTotal } = calculateCartDiscount();

        // Update Price UI
        if (discountPercent > 0) {
            originalPriceEl.textContent = formatRupiah(originalTotal);
            originalPriceEl.classList.remove('hidden');
            
            discountLabelEl.textContent = `Diskon ${Math.round(discountPercent * 100)}%`;
            discountLabelEl.classList.remove('hidden');
        } else {
            originalPriceEl.classList.add('hidden');
            discountLabelEl.classList.add('hidden');
        }
        totalPriceEl.textContent = formatRupiah(finalTotal);

        // Update Promo Banner
        promoBanner.classList.remove('hidden');
        if (totalQty >= 2) {
            promoBanner.className = "mb-md p-sm rounded-lg border-2 border-[#5a413c] bg-secondary-container text-on-secondary-container flex items-start gap-xs animate-reveal visible shadow-[2px_2px_0px_0px_rgba(90,65,60,1)]";
            promoBanner.innerHTML = `
                <span class="material-symbols-outlined text-secondary font-bold shrink-0 animate-pulse-slow">celebration</span>
                <div>
                    <p class="text-label-md font-bold">Diskon Kelipatan Aktif!</p>
                    <p class="text-body-md text-[13px] leading-snug">Selamat! Anda mendapatkan diskon sebesar <strong>${Math.round(discountPercent * 100)}%</strong> (Promo Kelipatan 5% tiap 2 item).</p>
                </div>
            `;
        } else {
            promoBanner.className = "mb-md p-sm rounded-lg border-2 border-[#5a413c] bg-primary-fixed text-on-primary-fixed flex items-start gap-xs animate-reveal visible shadow-[2px_2px_0px_0px_rgba(90,65,60,1)]";
            promoBanner.innerHTML = `
                <span class="material-symbols-outlined text-primary font-bold shrink-0 animate-pulse-slow">sell</span>
                <div>
                    <p class="text-label-md font-bold">Tips Hemat Seporsi!</p>
                    <p class="text-body-md text-[13px] leading-snug">Tambahkan kuantitas atau menu lain hingga minimal 2 pack untuk mendapatkan <strong>Diskon Kelipatan s.d 25%</strong>.</p>
                </div>
            `;
        }
    };

    const addToCart = (name, price, qty) => {
        const item = cart.find(i => i.name === name);
        if (item) {
            item.qty += qty;
        } else {
            cart.push({ name, price: parseInt(price), qty: qty });
        }
        saveCart();
        updateCartUI();
        
        // BUG FIX: Do NOT open cart modal automatically anymore
        // Only update UI silently
    };

    const removeFromCart = (name) => {
        cart = cart.filter(i => i.name !== name);
        saveCart();
        updateCartUI();
    };

    const updateCartQty = (name, qty) => {
        if (qty <= 0) {
            removeFromCart(name);
        } else {
            const item = cart.find(i => i.name === name);
            if (item) {
                item.qty = qty;
            }
            saveCart();
            updateCartUI();
        }
    };

    // ==========================================
    // DIRECT MODALS CONTROLLERS (BELI LANGSUNG)
    // ==========================================
    const directCheckoutModal = document.getElementById('checkoutModal');
    const directModalContent = document.getElementById('checkoutModalContent');
    const closeDirectModalBtn = document.getElementById('closeModal');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyValue = document.getElementById('qtyValue');
    const waCheckoutBtn = document.getElementById('waCheckoutBtn');

    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalTotalPrice = document.getElementById('modalTotalPrice');

    let currentProduct = '';
    let currentPrice = 0;
    let currentQty = 1;
    let currentPayment = '';

    const updateModal = () => {
        modalProductName.textContent = currentProduct;
        modalProductPrice.textContent = formatRupiah(currentPrice);
        qtyValue.textContent = currentQty;
        
        const originalTotal = currentPrice * currentQty;
        // BUG FIXED: Direct checkout now supports progressive mixed discount based on quantity
        const discountPercent = (currentQty >= 2 && currentQty % 2 === 0) ? (currentQty / 2) * 0.05 : 0;
        const discountAmount = Math.round(originalTotal * discountPercent);
        const finalTotal = originalTotal - discountAmount;

        const originalPriceEl = document.getElementById('modalOriginalPrice');
        const discountLabelEl = document.getElementById('modalDiscountLabel');

        if (discountPercent > 0) {
            originalPriceEl.textContent = formatRupiah(originalTotal);
            originalPriceEl.classList.remove('hidden');
            
            discountLabelEl.textContent = `Diskon ${Math.round(discountPercent * 100)}%`;
            discountLabelEl.classList.remove('hidden');
        } else {
            originalPriceEl.classList.add('hidden');
            discountLabelEl.classList.add('hidden');
        }

        modalTotalPrice.textContent = formatRupiah(finalTotal);
    };

    const resetPaymentBtns = () => {
        const paymentBtns = document.querySelectorAll('.payment-btn');
        paymentBtns.forEach(btn => {
            btn.classList.remove('border-primary', 'bg-primary-fixed');
            btn.classList.add('border-outline-variant', 'bg-surface-container');
            btn.querySelector('.payment-check').classList.add('opacity-0');
        });
    };

    const openDirectCheckoutModal = (name, price) => {
        currentProduct = name;
        currentPrice = parseInt(price);
        currentQty = 1;
        currentPayment = '';
        updateModal();

        resetPaymentBtns();
        document.getElementById('buyerName').value = '';
        document.getElementById('buyerLocation').value = '';
        document.getElementById('validationMsg').classList.add('hidden');
        document.getElementById('paymentValidationMsg').classList.add('hidden');

        directCheckoutModal.classList.remove('hidden');
        setTimeout(() => {
            directCheckoutModal.classList.remove('opacity-0');
            directModalContent.classList.remove('scale-95');
        }, 10);
    };

    const closeDirectCheckoutModal = () => {
        directCheckoutModal.classList.add('opacity-0');
        directModalContent.classList.add('scale-95');
        setTimeout(() => {
            directCheckoutModal.classList.add('hidden');
        }, 300);
    };

    // Direct Payment Buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            resetPaymentBtns();
            currentPayment = btn.dataset.method;
            btn.classList.remove('border-outline-variant', 'bg-surface-container');
            btn.classList.add('border-primary', 'bg-primary-fixed');
            btn.querySelector('.payment-check').classList.remove('opacity-0');
            document.getElementById('paymentValidationMsg').classList.add('hidden');
        });
    });

    closeDirectModalBtn.addEventListener('click', closeDirectCheckoutModal);

    qtyMinus.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            updateModal();
        }
    });

    qtyPlus.addEventListener('click', () => {
        currentQty++;
        updateModal();
    });

    // Handle Direct checkout WA click
    waCheckoutBtn.addEventListener('click', () => {
        const name = document.getElementById('buyerName').value.trim();
        const location = document.getElementById('buyerLocation').value.trim();
        const validationMsg = document.getElementById('validationMsg');
        const paymentValidationMsg = document.getElementById('paymentValidationMsg');

        let valid = true;

        if (!currentPayment) {
            paymentValidationMsg.classList.remove('hidden');
            valid = false;
        } else {
            paymentValidationMsg.classList.add('hidden');
        }

        if (!name || !location) {
            validationMsg.classList.remove('hidden');
            valid = false;
        } else {
            validationMsg.classList.add('hidden');
        }

        if (!valid) return;

        // BUG FIXED: direct checkout progressive discount calculations in WA template
        const originalTotal = currentPrice * currentQty;
        const discountPercent = (currentQty >= 2 && currentQty % 2 === 0) ? (currentQty / 2) * 0.05 : 0;
        const discountAmount = Math.round(originalTotal * discountPercent);
        const total = originalTotal - discountAmount;

        let discountText = '';
        if (discountPercent > 0) {
            discountText = `\nDiskon (${Math.round(discountPercent * 100)}%)   : -${formatRupiah(discountAmount)} (Promo Kelipatan)`;
        }

        const message =
`Halo Seporsi, saya ingin memesan secara langsung:

Produk          : ${currentProduct}
Jumlah          : ${currentQty} pack
Subtotal        : ${formatRupiah(originalTotal)}${discountText}
Total           : ${formatRupiah(total)}
Metode Bayar    : ${currentPayment}

---
Nama            : ${name}
Lokasi          : ${location}

Mohon info konfirmasi pesanannya. Terima kasih!`;

        const waUrl = `https://wa.me/6281249473536?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        closeDirectCheckoutModal();
    });

    directCheckoutModal.addEventListener('click', (e) => {
        if (e.target === directCheckoutModal) {
            closeDirectCheckoutModal();
        }
    });

    // ==========================================
    // ADD TO CART MODAL CONTROLLERS (PILIH JUMLAH)
    // ==========================================
    const addToCartModal = document.getElementById('addToCartModal');
    const addToCartModalContent = document.getElementById('addToCartModalContent');
    const closeAddToCartModalBtn = document.getElementById('closeAddToCartModal');
    const cartQtyMinus = document.getElementById('cartQtyMinus');
    const cartQtyPlus = document.getElementById('cartQtyPlus');
    const cartQtyValue = document.getElementById('cartQtyValue');
    const confirmAddToCartBtn = document.getElementById('confirmAddToCartBtn');

    const cartModalProductName = document.getElementById('cartModalProductName');
    const cartModalProductPrice = document.getElementById('cartModalProductPrice');
    const cartModalTotalPrice = document.getElementById('cartModalTotalPrice');

    let cartSelProduct = '';
    let cartSelPrice = 0;
    let cartSelQty = 1;

    const updateCartModalQty = () => {
        cartModalProductName.textContent = cartSelProduct;
        cartModalProductPrice.textContent = formatRupiah(cartSelPrice);
        cartQtyValue.textContent = cartSelQty;
        cartModalTotalPrice.textContent = formatRupiah(cartSelPrice * cartSelQty);
    };

    const openAddToCartModal = (name, price) => {
        cartSelProduct = name;
        cartSelPrice = parseInt(price);
        cartSelQty = 1;
        updateCartModalQty();

        addToCartModal.classList.remove('hidden');
        setTimeout(() => {
            addToCartModal.classList.remove('opacity-0');
            addToCartModalContent.classList.remove('scale-95');
        }, 10);
    };

    const closeAddToCartModal = () => {
        addToCartModal.classList.add('opacity-0');
        addToCartModalContent.classList.add('scale-95');
        setTimeout(() => {
            addToCartModal.classList.add('hidden');
        }, 300);
    };

    closeAddToCartModalBtn.addEventListener('click', closeAddToCartModal);

    cartQtyMinus.addEventListener('click', () => {
        if (cartSelQty > 1) {
            cartSelQty--;
            updateCartModalQty();
        }
    });

    cartQtyPlus.addEventListener('click', () => {
        cartSelQty++;
        updateCartModalQty();
    });

    confirmAddToCartBtn.addEventListener('click', () => {
        addToCart(cartSelProduct, cartSelPrice, cartSelQty);
        closeAddToCartModal();
    });

    addToCartModal.addEventListener('click', (e) => {
        if (e.target === addToCartModal) {
            closeAddToCartModal();
        }
    });

    // ==========================================
    // CART MODAL CONTROLLERS
    // ==========================================
    const cartModal = document.getElementById('cartModal');
    const cartModalContent = document.getElementById('cartModalContent');
    const closeCartModalBtn = document.getElementById('closeCartModal');
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
    let cartPayment = '';

    const resetCartPaymentBtns = () => {
        const cartPaymentBtns = document.querySelectorAll('.cart-payment-btn');
        cartPaymentBtns.forEach(btn => {
            btn.classList.remove('border-primary', 'bg-primary-fixed');
            btn.classList.add('border-outline-variant', 'bg-surface-container');
            btn.querySelector('.cart-payment-check').classList.add('opacity-0');
        });
    };

    const openCartModal = () => {
        cartPayment = '';
        resetCartPaymentBtns();
        document.getElementById('cartBuyerName').value = '';
        document.getElementById('cartBuyerLocation').value = '';
        document.getElementById('cartValidationMsg').classList.add('hidden');
        document.getElementById('cartPaymentValidationMsg').classList.add('hidden');

        cartModal.classList.remove('hidden');
        setTimeout(() => {
            cartModal.classList.remove('opacity-0');
            cartModalContent.classList.remove('scale-95');
        }, 10);
    };

    const closeCartModal = () => {
        cartModal.classList.add('opacity-0');
        cartModalContent.classList.add('scale-95');
        setTimeout(() => {
            cartModal.classList.add('hidden');
        }, 300);
    };

    // Cart Payment selection
    document.querySelectorAll('.cart-payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            resetCartPaymentBtns();
            cartPayment = btn.dataset.method;
            btn.classList.remove('border-outline-variant', 'bg-surface-container');
            btn.classList.add('border-primary', 'bg-primary-fixed');
            btn.querySelector('.cart-payment-check').classList.remove('opacity-0');
            document.getElementById('cartPaymentValidationMsg').classList.add('hidden');
        });
    });

    cartToggleBtn.addEventListener('click', openCartModal);
    closeCartModalBtn.addEventListener('click', closeCartModal);

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });

    // Cart Checkout WA click
    cartCheckoutBtn.addEventListener('click', () => {
        const name = document.getElementById('cartBuyerName').value.trim();
        const location = document.getElementById('cartBuyerLocation').value.trim();
        const validationMsg = document.getElementById('cartValidationMsg');
        const paymentValidationMsg = document.getElementById('cartPaymentValidationMsg');

        let valid = true;

        if (!cartPayment) {
            paymentValidationMsg.classList.remove('hidden');
            valid = false;
        } else {
            paymentValidationMsg.classList.add('hidden');
        }

        if (!name || !location) {
            validationMsg.classList.remove('hidden');
            valid = false;
        } else {
            validationMsg.classList.add('hidden');
        }

        if (!valid) return;

        const { originalTotal, totalQty, discountPercent, discountAmount, finalTotal } = calculateCartDiscount();

        // Format items text
        const itemsText = cart.map(item => `   - ${item.name} (${item.qty} pack) @ ${formatRupiah(item.price)}`).join('\n');

        let discountText = '';
        if (discountPercent > 0) {
            discountText = `\nDiskon (${Math.round(discountPercent * 100)}%)   : -${formatRupiah(discountAmount)} (Promo Kelipatan)`;
        }

        const message =
`Halo Seporsi, saya ingin memesan dari keranjang belanja:

Menu Dipesan:
${itemsText}

Subtotal        : ${formatRupiah(originalTotal)}${discountText}
Total           : ${formatRupiah(finalTotal)}
Metode Bayar    : ${cartPayment}

---
Nama            : ${name}
Lokasi          : ${location}

Mohon info konfirmasi pesanannya. Terima kasih!`;

        const waUrl = `https://wa.me/6281249473536?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        
        // Empty the cart after checking out
        cart = [];
        saveCart();
        updateCartUI();
        closeCartModal();
    });

    // ==========================================
    // CATALOG BUTTONS INTERFACES
    // ==========================================
    document.querySelectorAll('.beli-langsung-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openDirectCheckoutModal(btn.dataset.name, btn.dataset.price);
        });
    });

    document.querySelectorAll('.tambah-keranjang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openAddToCartModal(btn.dataset.name, btn.dataset.price);
        });
    });

    // Run initial rendering
    updateCartUI();
});
