<script setup lang="ts">
// The placeholder start page of a new app. Replace it with the system's first page.
const zh = useIsChinese();
</script>

<template>
  <div class="retro-stack">
    <p class="retro-center" style="font-family: var(--retro-serif); font-size: 1.4rem">
      {{ zh ? '你的系统将在这里出现' : 'Your system will appear right here' }}<span class="retro-note">*</span>
    </p>
    <div class="retro-row">
      <div class="retro-grow retro-stack">
        <RetroBox :title="zh ? '怎么开始' : 'Find it'">
          <template #action><RetroButton variant="oval">{{ zh ? '出发！' : "Let's go!" }}</RetroButton></template>
          <h3>{{ zh ? '三步完成：' : 'Check out:' }}</h3>
          <ul class="retro-dots">
            <li>{{ zh ? '在对话里描述你要的系统' : 'Describe the system you want in the chat' }}</li>
            <li>{{ zh ? '看着页面在这个预览里出现' : 'Watch its pages appear in this preview' }}</li>
            <li>{{ zh ? '直接使用，数据真实保存' : 'Use it: what you enter is really stored' }}</li>
          </ul>
        </RetroBox>
        <RetroBox :title="zh ? '组件' : 'Get more info'" tone="plain">
          <p>{{ zh ? '这套复古设计体系自带的部件：' : 'What this retro design system comes with:' }}</p>
          <table class="retro-table">
            <thead><tr><th>{{ zh ? '部件' : 'Part' }}</th><th>{{ zh ? '用途' : 'Used for' }}</th></tr></thead>
            <tbody>
              <tr><td>RetroBox</td><td>{{ zh ? '带椭圆标题的粗边内容框' : 'Thick-bordered box with an oval title' }}</td></tr>
              <tr><td>RetroButton</td><td>{{ zh ? '灰色凸起按钮与椭圆按钮' : 'Grey bevelled and oval buttons' }}</td></tr>
              <tr><td>retro-table</td><td>{{ zh ? '带格线的数据表' : 'Ruled data table' }}</td></tr>
            </tbody>
          </table>
        </RetroBox>
      </div>
      <RetroPanel :title="zh ? '尚未生成' : 'Not built yet'">
        <p>{{ zh ? '这是 Nocco 为新项目准备的起始页。' : 'This is the start page Nocco gives every new project.' }}</p>
        <p><RetroBadge blink>{{ zh ? '新！' : 'NEW!' }}</RetroBadge></p>
        <p class="retro-small">{{ zh ? '模板：复古 · 90 年代网页' : 'Template: retro · 90s web' }}</p>
      </RetroPanel>
    </div>
    <p class="retro-center retro-note retro-small">* {{ zh ? '等待第一次生成' : 'Awaiting first generation' }}</p>
  </div>
</template>
