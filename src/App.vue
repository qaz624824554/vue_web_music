<template>
  <div id="app">
    <m-header></m-header>
    <tag></tag>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tag from 'components/tag/tag'
import Player from 'components/player/player'

export default {
  name: 'App',
  components: {
    MHeader,
    Tag,
    Player
  }
}
</script>

<style lang="stylus">
</style>
