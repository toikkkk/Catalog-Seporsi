document.addEventListener("DOMContentLoaded", () => {
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

    // Checkout Logic
    const modal = document.getElementById('checkoutModal');
    const modalContent = document.getElementById('checkoutModalContent');
    const closeModalBtn = document.getElementById('closeModal');
    const tambahBtns = document.querySelectorAll('.tambah-btn');
    const paymentBtns = document.querySelectorAll('.payment-btn');

    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalTotalPrice = document.getElementById('modalTotalPrice');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyValue = document.getElementById('qtyValue');
    const waCheckoutBtn = document.getElementById('waCheckoutBtn');

    let currentProduct = '';
    let currentPrice = 0;
    let currentQty = 1;
    let currentPayment = '';

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number).replace('Rp', 'Rp ');
    };

    const updateModal = () => {
        modalProductName.textContent = currentProduct;
        modalProductPrice.textContent = formatRupiah(currentPrice);
        qtyValue.textContent = currentQty;
        modalTotalPrice.textContent = formatRupiah(currentPrice * currentQty);
    };

    const resetPaymentBtns = () => {
        paymentBtns.forEach(btn => {
            btn.classList.remove('border-primary', 'bg-primary-fixed');
            btn.classList.add('border-outline-variant', 'bg-surface-container');
            btn.querySelector('.payment-check').classList.add('opacity-0');
        });
    };

    const openModal = (name, price) => {
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

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalContent.classList.remove('scale-95');
        }, 10);
    };

    const closeCheckoutModal = () => {
        modal.classList.add('opacity-0');
        modalContent.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    // Payment button selection
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resetPaymentBtns();
            currentPayment = btn.dataset.method;
            btn.classList.remove('border-outline-variant', 'bg-surface-container');
            btn.classList.add('border-primary', 'bg-primary-fixed');
            btn.querySelector('.payment-check').classList.remove('opacity-0');
            document.getElementById('paymentValidationMsg').classList.add('hidden');
        });
    });

    tambahBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(btn.dataset.name, btn.dataset.price);
        });
    });

    closeModalBtn.addEventListener('click', closeCheckoutModal);

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

        const total = currentPrice * currentQty;
        const message =
`Halo Seporsi, saya ingin memesan:

Produk          : ${currentProduct}
Jumlah          : ${currentQty} pack
Total           : ${formatRupiah(total)}
Metode Bayar    : ${currentPayment}

---
Nama            : ${name}
Lokasi          : ${location}

Mohon info konfirmasi pesanannya. Terima kasih!`;

        const waUrl = `https://wa.me/6281249473536?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        closeCheckoutModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCheckoutModal();
        }
    });
});
