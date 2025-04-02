<template>
    <footer class="footer">
        <div class="footer-content">
            <span class="copyright">
                © 2025 Solo Coding. All rights reserved.
            </span>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'cc-footer'
}
</script>

<style lang="less" scoped>
.footer {
    padding: 20px 0;
    background: #333;
    color: #fff;

    .footer-content {
        width: 100%;
        margin: 0 auto;
        text-align: center;
    }

    @media screen and (max-width: 768px) {
        .footer-content {
            width: 100%;
            padding: 0 0px;
        }
    }
}
</style>