/*
 * Talibri+
 * by Zaalah
 */

/* global $ localStorage window MutationObserver document Audio */

$(document).ready(() => {
  /**
   * Initial setup with variables and the settings
   */
  const getUsername = () => $.trim($('i.fa-user-circle').parent().text())
  const chatPing = new Audio('https://soundbible.com/grab.php?id=1424&type=mp3')

  let game = {
    user: getUsername(),
    pref: {
      chatpings: true,
      sounds: true,
    },
  }

  /**
   * Chat features
   */
  const chatAlert = (message) => {
    $(message).css('padding', '2px')
    $(message).css('background-color', 'rgba(51, 122, 183, 0.3)')

    if (game.pref.sounds === true) {
      chatPing.play()
    }
  }

  const reactToChatPings = (changes) => {
    changes.forEach((change) => {
      const newMessage = change.target.children[change.target.children.length - 1]
      if ($(newMessage).text().toLowerCase().indexOf(`@${$.trim(game.user.toLowerCase())}`) !== -1) {
        chatAlert(newMessage)
      }
    })
  }

  const listenForChatPings = () => {
    const messageBox = $('#messages')[0]
    const config = { childList: true }

    const observer = new MutationObserver(reactToChatPings)
    observer.observe(messageBox, config)
  }

  /**
   * Settings window to let the user change features
   */
  $($('#bs-example-navbar-collapse-1 ul.navbar-nav.navbar-right li.dropdown ul.dropdown-menu').splice(-1)[0])
    .append('<li class="text-center"><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#talibriPlusModal" id="talibriPlusSettings">Talibri+ Settings</button></li>')

  let modal = ''
  modal += '<div class="modal fade" tabindex="-1" role="dialog" id="talibriPlusModal">'
  modal += '<div class="modal-dialog" role="document">'
  modal += '<div class="modal-content">'
  modal += '<div class="modal-header">'
  modal += '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
  modal += '<h4 class="modal-title">Talibri+ Settings</h4>'
  modal += '</div>'
  modal += '<div class="modal-body">'
  modal += '<form>'
  modal += '<div class="checkbox">'
  modal += '<label><input id="chatpings" type="checkbox">Chat Pings</label>'
  modal += '</div>'
  modal += '<div class="checkbox">'
  modal += '<label><input id="sounds" type="checkbox">Sounds</label>'
  modal += '</div>'
  modal += '</form>'
  modal += '</div>'
  modal += '<div class="modal-footer">'
  modal += '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
  modal += '<button id="saveSettings" type="button" class="btn btn-primary">Save Settings</button>'
  modal += '</div></div></div></div>'
  $(document.body).append(modal)

  /* Set the default values of the preference boxes based on game variable */
  $('#talibriPlusSettings').click(() => {
    $('#chatpings').prop('checked', game.pref.chatpings)
    $('#sounds').prop('checked', game.pref.sounds)
  })

  $('#saveSettings').click(() => {
    game.pref.chatpings = $('#chatpings').is(':checked')
    game.pref.sounds = $('#sounds').is(':checked')
    saveUserPreferences()

    $('#talibriPlusModal').modal('hide')
  })

  /**
   * Utility functions to load, save, and start the script when loaded up
   */
  const loadUserPreferences = () => {
    const preferences = JSON.parse(localStorage.getItem('talibriplus'))
    game = preferences
  }

  const saveUserPreferences = () => {
    localStorage.setItem('talibriplus', JSON.stringify(game))
  }

  $(window).bind('beforeunload', () => {
    saveUserPreferences()
  })

  const updateSettings = () => {
    if (game.pref.chatpings === true) {
      listenForChatPings()
    }
  }

  const init = () => {
    loadUserPreferences()
    updateSettings()
  }

  init()
})
