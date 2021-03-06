(function () {
    'use strict';

    angular
        .module('ytApp')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$q', '$stateParams',
                                'playlistService', 'SearchResource'];

    function SearchController($q, $stateParams, playlistService, SearchResource) {
        var vm = this;

        vm.searchResult = [];
        vm.playlistService = playlistService;
        vm.searchText = $stateParams.searchText;
        vm.addToPlayList = addToPlayList;
        vm.removeFromPlayList = removeFromPlayList;
        vm.isVideoInList = isVideoInList;

        var performSearch = function () {
            SearchResource.query({
                q: vm.searchText
            }, onSearchResult);
        };

        function onSearchResult(data) {
            vm.searchResult = filterYoutubeChannelsAndPlaylists(data.items);
            if (!playlistService.selectedPlaylist() && playlistService.playlists.length) {
                humane.log('Select a playlist first');
            }
        }

        function filterYoutubeChannelsAndPlaylists(items) {
            var arr = [];
            items.forEach(function (item) {
                if (item.id.kind === 'youtube#video') {
                    arr.push(item);
                }
            });
            return arr;
        }

        function isVideoInList(searchItem) {
            return playlistService.isItemInPlayList(
                playlistService.selectedPlaylist(),
                searchItem.id.videoId
            );
        }

        function addToPlayList(searchItem) {
            if (!playlistService.selectedPlaylist()) {
                if (playlistService.playlists.length) {
                    humane.log('Select a playlist first');
                } else {
                    humane.log('For a start - add at least one playlist');
                }
            } else {
                if (!isVideoInList(searchItem)) {
                    playlistService.addItemToPlaylist(
                        playlistService.selectedPlaylist(),
                        searchItem.id.videoId
                    );
                }
            }
        }

        function itemIndexInPlaylist(searchItem) {
            return _.findIndex(playlistService.selectedPlaylist().items, function (item) {
                return item.snippet.resourceId.videoId === searchItem.id.videoId;
            });
        }

        function removeFromPlayList(searchItem) {
            var index = itemIndexInPlaylist(searchItem);

            if (index !== -1 && isVideoInList(searchItem)) {
                playlistService.removeItemFromPlaylist(playlistService.selectedPlaylist(),
                    playlistService.selectedPlaylist().items[index]);
            }
        }

        playlistService.playlistsPromise.then(function () {
            performSearch();
        });
    }
}());
