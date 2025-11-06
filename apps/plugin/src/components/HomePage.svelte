<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import BaseLayout from "./BaseLayout.svelte";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../lib/utils/plugin-api-endpoint";
  import OrgSelectorItem from "./sidebar/OrgSelectorItem.svelte";
  import LogoutButton from "./LogoutButton.svelte";
  import TemplateListItem from "./sidebar/TemplateListItem.svelte";
  import TemplatesView from "./views/TemplatesView.svelte";
  import TemplatePreviewView from "./views/TemplatePreviewView.svelte";
  import SidebarItem from "./sidebar/SidebarItem.svelte";
  import { featuresStore } from "../lib/stores/enabledFeaturesStore";
  import PreviewOptions from "./sidebar/PreviewOptions.svelte";
  import { MainThreadMsg, UiMsg } from "../lib/utils/shared/messages";
  import type { AppNode } from "../types";
  import { sendToMainThread } from "../lib/utils/messages";
  import { getHtmlDocumentFromAppNode } from "../app-node-to-hscript";
  import { onClickDownloadTemplate } from "../lib/utils/download";

  let organizations: { id: string; name: string }[] | null | undefined =
    undefined;
  let selectedOrgId: string | undefined | null = undefined;
  async function loadOrganizations() {
    const response = await callTemplettoApi({
      action: TemplettoApiActions.getOrganizations,
    });
    if (!response.ok) {
      console.error("failed_to_get_organizations", response);
      return null;
    }
    const _organizations = await response.json();
    if (_organizations && _organizations.length > 0) {
      organizations = _organizations;
      selectedOrgId = _organizations[0].id;
      return;
    }
    organizations = null;
    selectedOrgId = null;
  }

  type TemplateInfo = [AppNode, { fontNames: string[] }];
  let templateInfo: null | undefined | TemplateInfo = null;
  let selectedFrameId: string | undefined = undefined;
  let frameSelectOptions: { id: string; name: string }[] | undefined =
    undefined;
  function onMessage(event: MessageEvent) {
    const { type, data } = event.data.pluginMessage;
    if (type === MainThreadMsg.PostFrameNodes) {
      const _templateInfo = data.node as [
        AppNode | null,
        { fontNames: string[] },
      ];
      templateInfo = _templateInfo;
    }
    if (type === MainThreadMsg.PostFrameInfosForSelector) {
      // TODO: update only if array changed
      frameSelectOptions = data.frames as { id: string; name: string }[];
      if (!selectedFrameId && frameSelectOptions.length > 0) {
        selectedFrameId = frameSelectOptions[0].id;
      }
    }
  }
  window.addEventListener("message", onMessage);

  let htmlString: string | undefined = undefined;
  function onTemplateInfoChange(templateInfo: null | undefined | TemplateInfo) {
    if (!templateInfo) {
      htmlString = undefined;
      return;
    }
    const [rootAppNode, { fontNames }] = templateInfo;
    const html = getHtmlDocumentFromAppNode(rootAppNode, new Set(fontNames));
    htmlString = html.outerHTML;
  }
  $: onTemplateInfoChange(templateInfo);

  onMount(async () => {
    if ($featuresStore.apiCalls) {
      await loadOrganizations();
    }
    sendToMainThread(UiMsg.RequestSelectableFrames);
  });

  onDestroy(() => {
    window.removeEventListener("message", onMessage);
  });

  let view: View = "preview";
  const views = ["templates", "preview"] as const;
  type View = (typeof views)[number];
</script>

<BaseLayout>
  <div slot="sidebar" class="sidebar">
    <div class="panel">
      <PreviewOptions
        isDownloadEnabled={!!htmlString}
        onClickDownload={() => {
          if (!htmlString) {
            console.error("expected_htmlString");
            return;
          }
          onClickDownloadTemplate({ htmlString });
        }}
        onSelectFrame={(frameId) => {
          selectedFrameId = frameId;
        }}
        frameInfos={frameSelectOptions}
        {selectedFrameId}
        onClickOnSelectElement={() => {
          sendToMainThread(UiMsg.RequestSelectableFrames);
        }}
      />
      {#if $featuresStore.apiCalls}
        <OrgSelectorItem
          orgInfos={organizations}
          {selectedOrgId}
          onSelect={(orgId) => {
            selectedOrgId = orgId;
          }}
        />
        <TemplateListItem onClick={() => (view = "templates")} />
        <SidebarItem onClick={() => (view = "preview")}>
          <div slot="header" class="header">
            <div>Preview</div>
          </div>
        </SidebarItem>
      {/if}
    </div>
    {#if $featuresStore.apiCalls}
      <LogoutButton />
    {/if}
  </div>

  <div slot="content" class="content">
    {#if view === "templates"}
      <TemplatesView orgId={selectedOrgId} />
    {:else if view === "preview"}
      <TemplatePreviewView
        orgId={selectedOrgId}
        {templateInfo}
        onClickShowPreview={() => {
          templateInfo = undefined;
          sendToMainThread(UiMsg.ShowPreview, { frameId: selectedFrameId });
        }}
        {htmlString}
      />
    {/if}
  </div>
</BaseLayout>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }

  .panel {
    display: flex;
    flex-direction: column;
  }
</style>
