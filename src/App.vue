<template>
  <div id="app">
    <m-header></m-header>
    <tag></tag>
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tag from 'components/tag/tag'

export default {
  name: 'App',
  components: {
    MHeader,
    Tag
  }
}
</script>

<style lang="stylus">
@import 'common/stylus/variable.styl';
  #app
    color $color-theme;
</style>
