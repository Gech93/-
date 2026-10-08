<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style>
page {
  --dopamine-primary: #ff6b9d;
  --dopamine-primary-dark: #e8487c;
  --dopamine-purple: #a78bfa;
  --dopamine-mint: #5eead4;
  --dopamine-yellow: #fcd34d;
  --dopamine-blue: #60a5fa;
  --dopamine-orange: #fb923c;
  --dopamine-bg: #fff7f0;
  --dopamine-card: #ffffff;
  --dopamine-text: #2d2a3e;
  --dopamine-text-sub: #8b85a0;
  --dopamine-danger: #f87171;
  --dopamine-border: #f3eef5;
  --dopamine-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.15);
  --dopamine-gradient: linear-gradient(135deg, #ff6b9d 0%, #a78bfa 100%);
  --dopamine-gradient-soft: linear-gradient(135deg, #ffe4ef 0%, #ede9fe 100%);

  background-color: var(--dopamine-bg);
  color: var(--dopamine-text);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
}
</style>
