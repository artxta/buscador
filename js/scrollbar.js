function inicializarScrollbar() {
    const wrapper = document.getElementById('tableWrapper');
    const scrollbar = document.getElementById('tableScrollbar');
    const thumb = document.getElementById('tableScrollbarThumb');
    if (!wrapper || !scrollbar || !thumb) return;

    const table = wrapper.querySelector('.table-centros');
    if (!table || table.scrollWidth <= wrapper.clientWidth) {
        scrollbar.style.display = 'none';
        return;
    }

    scrollbar.style.display = 'block';
    const ratio = wrapper.clientWidth / table.scrollWidth;
    thumb.style.width = Math.max(40, ratio * 100) + '%';
    thumb.style.left = '0px';

    thumb.addEventListener('mousedown', e => {
        scrollbarDragging = true;
        scrollbarStartX = e.pageX;
        scrollbarScrollStart = wrapper.scrollLeft;
        e.preventDefault();
    });

    thumb.addEventListener('touchstart', e => {
        scrollbarDragging = true;
        scrollbarStartX = e.touches[0].pageX;
        scrollbarScrollStart = wrapper.scrollLeft;
    }, { passive: true });

    wrapper.addEventListener('scroll', () => {
        if (scrollbarDragging) return;
        const t = wrapper.querySelector('.table-centros');
        if (!t) return;
        const maxScroll = t.scrollWidth - wrapper.clientWidth;
        if (maxScroll <= 0) return;
        const pct = wrapper.scrollLeft / maxScroll;
        const maxThumbMove = scrollbar.clientWidth - thumb.clientWidth;
        thumb.style.left = (pct * maxThumbMove) + 'px';
    });

    scrollbar.addEventListener('mousedown', e => {
        if (e.target === thumb) return;
        const rect = scrollbar.getBoundingClientRect();
        const clickPct = (e.clientX - rect.left) / rect.width;
        const t = wrapper.querySelector('.table-centros');
        if (!t) return;
        const maxScrollX = t.scrollWidth - wrapper.clientWidth;
        const maxScrollY = t.scrollHeight - wrapper.clientHeight;
        wrapper.scrollLeft = clickPct * maxScrollX;
        if (maxScrollY > 0) wrapper.scrollTop = clickPct * maxScrollY;
    });

    scrollbar.addEventListener('touchstart', e => {
        if (e.target === thumb) return;
        const rect = scrollbar.getBoundingClientRect();
        const clickPct = (e.touches[0].clientX - rect.left) / rect.width;
        const t = wrapper.querySelector('.table-centros');
        if (!t) return;
        const maxScrollX = t.scrollWidth - wrapper.clientWidth;
        const maxScrollY = t.scrollHeight - wrapper.clientHeight;
        wrapper.scrollLeft = clickPct * maxScrollX;
        if (maxScrollY > 0) wrapper.scrollTop = clickPct * maxScrollY;
    }, { passive: true });

    if (!scrollbarListenersInit) {
        scrollbarListenersInit = true;
        document.addEventListener('mousemove', e => {
            if (!scrollbarDragging) return;
            const w = document.getElementById('tableWrapper');
            const t = w ? w.querySelector('.table-centros') : null;
            const sb = document.getElementById('tableScrollbar');
            const th = document.getElementById('tableScrollbarThumb');
            if (!w || !t || !sb || !th) return;
            const dx = e.pageX - scrollbarStartX;
            const maxScrollX = t.scrollWidth - w.clientWidth;
            const maxScrollY = t.scrollHeight - w.clientHeight;
            const maxThumbMove = sb.clientWidth - th.clientWidth;
            const scrollDelta = (dx / maxThumbMove) * maxScrollX;
            w.scrollLeft = scrollbarScrollStart + scrollDelta;
            if (maxScrollY > 0) {
                const pctX = w.scrollLeft / maxScrollX;
                w.scrollTop = pctX * maxScrollY;
            }
        });
        document.addEventListener('mouseup', () => { scrollbarDragging = false; });

        document.addEventListener('touchmove', e => {
            if (!scrollbarDragging) return;
            const w = document.getElementById('tableWrapper');
            const t = w ? w.querySelector('.table-centros') : null;
            const sb = document.getElementById('tableScrollbar');
            const th = document.getElementById('tableScrollbarThumb');
            if (!w || !t || !sb || !th) return;
            const dx = e.touches[0].pageX - scrollbarStartX;
            const maxScrollX = t.scrollWidth - w.clientWidth;
            const maxScrollY = t.scrollHeight - w.clientHeight;
            const maxThumbMove = sb.clientWidth - th.clientWidth;
            const scrollDelta = (dx / maxThumbMove) * maxScrollX;
            w.scrollLeft = scrollbarScrollStart + scrollDelta;
            if (maxScrollY > 0) {
                const pctX = w.scrollLeft / maxScrollX;
                w.scrollTop = pctX * maxScrollY;
            }
        }, { passive: true });
        document.addEventListener('touchend', () => { scrollbarDragging = false; });
    }
}
