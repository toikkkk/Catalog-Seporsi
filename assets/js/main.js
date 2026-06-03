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

    const openModal = (name, price) => {
        currentProduct = name;
        currentPrice = parseInt(price);
        currentQty = 1;
        updateModal();

        document.getElementById('buyerName').value = '';
        document.getElementById('buyerLocation').value = '';
        document.getElementById('validationMsg').classList.add('hidden');

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

        if (!name || !location) {
            validationMsg.classList.remove('hidden');
            return;
        }
        validationMsg.classList.add('hidden');

        const total = currentPrice * currentQty;
        const message =
`Halo Seporsi, saya ingin memesan:

Produk  : ${currentProduct}
Jumlah  : ${currentQty} pack
Total   : ${formatRupiah(total)}

---
Nama    : ${name}
Lokasi  : ${location}

Mohon info untuk pembayarannya. Terima kasih!`;

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
