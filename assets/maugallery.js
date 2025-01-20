// IIFE (Immediately Invoked Function Expression) créant un scope local dans lequel le code va être exécuté.
// Le signe dollar "$" fait référence à JQuery
(function ($) {
  // Définition de la méthode principale "mauGallery" attachée à JQuery (plugin)
  $.fn.mauGallery = function (options) {
    // Fusion des options par défaut avec celles spécifiées par l'utilisateur
    var options = $.extend($.fn.mauGallery.defaults, options);
    // Tableau pour stocker les tags uniques de la galerie
    var tagsCollection = [];
    // On applique la méthode à chaque élément de la galerie
    return this.each(function () {
      // Création de l'élément de rangée pour la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));
      // Si la LightBox est activée dans les options
      if (options.lightBox) {
        // Création de la LightBox
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      // Attacher les événements aux éléments de la galerie
      $.fn.mauGallery.listeners(options);

      // Boucle sur chaque élément enfant de type ".gallery-item"
      $(this)
        .children(".gallery-item")
        .each(function (index) {

          // Applique la classe 'img-fluid' pour rendre l'image responsive
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          // Déplace l'élément dans l'élément ".gallery-items-row"
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          // Enveloppe l'élément dans une colonne avec la classe appropriée selon le nombre de colonnes
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          // Récupère le tag associé à l'élément
          var theTag = $(this).data("gallery-tag");
          // Si l'option showTags est activée et que le tag est défini et non déjà dans la collection
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            // Ajouter le tag à la collection de tags
            tagsCollection.push(theTag);
          }
        });

      // Si l'option showTags est activée, on affiche les tags dans la galerie
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }
      // Applique un effet fade-in à la galerie
      $(this).fadeIn(500);
    });
  };

  // Options par défaut pour la galerie
  $.fn.mauGallery.defaults = {
    columns: 3,             // Nombre de colonnes par défaut
    lightBox: true,         // LightBox activée par défaut
    lightboxId: null,       // ID de la LightBox (null si non défini)
    showTags: true,         // Affichage des tags activé par défaut
    tagsPosition: "bottom", // Position des tags par défaut : en bas
    navigation: true        // Navigation (flèches) activée par défaut dans la LightBox
  };

  // Fonction pour gérer les écouteurs d'événements de la galerie
  $.fn.mauGallery.listeners = function (options) {

    // Écouteur sur les éléments ".gallery-item", qui ouvre la LightBox quand on clique sur une image
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        // Ouvrir la LightBox si l'option est activée
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Écouteur pour les liens de navigation de tags
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    // Écouteurs pour les boutons de navigation dans la LightBox (précédent et suivant)
    $(".gallery").on("click", ".mg-prev", () => {
      $.fn.mauGallery.methods.prevImage(options.lightboxId);
    });
    $(".gallery").on("click", ".mg-next", () => {
      $.fn.mauGallery.methods.nextImage(options.lightboxId);
    });
  };

  // Méthodes liées à la galerie
  $.fn.mauGallery.methods = {
    // Crée un wrapper de rangée pour les éléments de la galerie
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        // Ajoute une rangée s'il n'en existe pas déjà une
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    // Enveloppe un élément dans une colonne selon le nombre de colonnes spécifié
    wrapItemInColumn(element, columns) {
      // Si 'columns' est un nombre, on calcule la largeur de la colonne
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        // Si 'columns' est un objet, on définit la largeur de la colonne pour chaque point de rupture (xs, sm, md, etc.)
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        // Enveloppe l'élément dans une colonne avec les classes calculées
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        // Si le format des colonnes est incorrect
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    // Déplace un élément dans le wrapper de la rangée
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    // Rend une image responsive en lui ajoutant la classe 'img-fluid'
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    // Ouvre la LightBox et affiche l'image sélectionnée
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    // Affiche l'image précédente dans la LightBox
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i - 1;  // Image précédente dans la modale
        }
      });
      next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    // Affiche l'image suivante dans la LightBox
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i + 1; // Image suivante dans la modale
        }
      });
      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    // Crée la modale (LightBox) dans la galerie
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"
        }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${navigation
          ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
          : '<span style="display:none;" />'
        }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${navigation
          ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
          : '<span style="display:none;" />'
        }
                        </div>
                    </div>
                </div>
            </div>`);
    },


    // Affiche les tags dans la galerie
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      // Positionne les tags soit en haut, soit en bas
      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    // Filtre les éléments par tag
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      // Retire les classes 'active' et 'active-tag' de l'élément actuellement actif
      $(".active-tag").removeClass("active active-tag");
      // Ajoute les classes 'active' et 'active-tag' à l'élément cliqué
      $(this).addClass("active active-tag");

      var tag = $(this).data("images-toggle");
      // Affiche ou masque les images en fonction du tag sélectionné
      $(".gallery-item").each(function () {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);